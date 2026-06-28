const express = require("express");
const router = express.Router();
const { getConnection } = require("../db");

// GET
router.get("/", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM tblCertificateVerificationResult");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Database Error");
    }
});

router.get("/lookup", async (req, res) => {
    const pool = await getConnection();

    const [verification, equipmentType, equipmentName, certType, users, certNames, QACerts,
        status, priority, issueCategories, issueEquipmentName, collectionTask, issueList
    ] = await Promise.all([
        // Equipment QA
        pool.request().query("SELECT DISTINCT [Verification Result] As verificationResult FROM tblCertificateVerificationResult ORDER BY [Verification Result] ASC;"),
        pool.request().query("SELECT DISTINCT [Equipment Type] As equipmentType FROM tblEquipmentInventory WHERE Discontinued = 0 AND [Equipment Type] IS NOT NULL;"),
        pool.request().query("SELECT DISTINCT [Equipment Name] As equipmentName FROM tblEquipmentInventory WHERE Discontinued = 0 And [Equipment Name] <> 'Others' ORDER BY [Equipment Name] ASC;"),
        pool.request().query("SELECT DISTINCT [Certification Type] As certificationType FROM tblCertificationsNames WHERE Discontinued = 0 ORDER BY [Certification Type] ASC;"),
        pool.request().query("SELECT UserName FROM tblUsers ORDER BY UserName ASC;"),
        pool.request().query("SELECT * FROM tblCertificationsNames"),
        pool.request().query("SELECT * FROM tblCertifications"),
        
        // Data Issues
        pool.request().query("SELECT Status FROM tblDataCollectionIssuesStatus;"),
        pool.request().query("SELECT Priority FROM tblDataCollectionIssuesPriorityLevel;"),
        pool.request().query("SELECT * FROM tblDataCollectionIssuesCategories;"),
        pool.request().query("SELECT DISTINCT [Equipment Name] As equipmentName FROM tblEquipmentInventory WHERE Discontinued = 0 And [Equipment Name] IS NOT NULL;"),
        pool.request().query("SELECT DISTINCT [Collection Task Type] FROM tblDataCollectionTask WHERE Discontinued = 0;"),
        pool.request().query("SELECT * FROM tblDataCollectionIssuesList")
    ]);

    res.json({
        // Equipment QA
        verification: verification.recordset,
        equipmentType: equipmentType.recordset,
        equipmentName: equipmentName.recordset,
        certType: certType.recordset,
        users: users.recordset,
        certNames: certNames.recordset,
        QACerts: QACerts.recordset,

        // Data Issues
        status: status.recordset,
        priority: priority.recordset,
        issueCategories: issueCategories.recordset,
        issueEquipmentName: issueEquipmentName.recordset,
        collectionTask: collectionTask.recordset,
        issueList: issueList.recordset
    });
});

// POST
router.post("/", async (req, res) => {
    try {
        const pool = await getConnection();
        const { VerificationResult } = req.body;

        const result = await pool.request()
            .input("VerificationResult", VerificationResult)
            .query(`
                INSERT INTO tblCertificateVerificationResult (VerificationResult)
                VALUES (@VerificationResult);
                `);

        res.json({
            message: "Inserted successfully",
            value: VerificationResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

router.post("/upload-issue", async(req, res) => {
    try {
        const pool = await getConnection();

        const {
            category,
            status,
            closedDate,
            equipmentName,
            followUp,
            recordType,
            collectionTask,
            priority,
            comments,
            assigned,
            IssueID
        } = req.body;

        const request = pool.request()
            .input("Category", category)
            .input("Status", status)
            .input("ClosedDate", closedDate || null)
            .input("EquipmentName", equipmentName)
            .input("FollowUp", followUp)
            //.input("Status", recordType)
            .input("CollectionTask", collectionTask)
            .input("Priority", priority)
            .input("Comments", comments)
            .input("AssignedTo", assigned)
            .input("IssueID", IssueID);
        
        if (recordType === "New Record") {
            await request.query(`
                INSERT INTO tblDataCollectionIssuesList (
                    IssuesID,
                    AssignedTo,
                    Comments,
                    Priority,
                    Category,
                    [Data Collection Task],
                    Status,
                    ReportedDate,
                    ClosedDate,
                    [Equipment Name],
                    ReportedBy,
                    [Follow Up]
                )
                VALUES (
                    52202,
                    @AssignedTo,
                    @Comments,
                    @Priority,
                    @Category,
                    @CollectionTask,
                    @Status,
                    GETDATE(),
                    @ClosedDate,
                    @EquipmentName,
                    'Eli',
                    @FollowUp
                );
            `);

            return res.json({ message: "New issue created successfully" });
        } else {
            await request.query(`
                UPDATE tblDataCollectionIssuesList
                SET
                    AssignedTo = @AssignedTo,
                    Comments = @Comments,
                    Priority = @Priority,
                    Category = @Category,
                    [Data Collection Task] = @CollectionTask,
                    Status = @Status,
                    ClosedDate = @ClosedDate,
                    [Equipment Name] = @EquipmentName,
                    [Follow Up] = @FollowUp
                WHERE IssuesID = @IssueID;
            `);

            return res.json({ message: "Issue updated successfully" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Database Error" });
    }
})

router.post("/upload-qa", async(req, res) => {
    try {
        const pool = await getConnection();

        const {
            recordType,
            certificationType,
            equipmentName,
            equipmentType,
            verificationResult,
            dateCert,
            comments,
            certifications
        } = req.body;

        const request = pool.request()
            .input("CertificationType", certificationType)
            .input("EquipmentName", equipmentName)
            .input("EquipmentType", equipmentType)
            .input("VerificationResult", verificationResult)
            .input("DateCert", dateCert)
            .input("Comments", comments);
        
        if (recordType === "New Record") {
            if (!Array.isArray(certifications) || certifications.length === 0) {
                return res.status(400).json({ message: "No certifications." });
            }

            for (const cert of certifications) {
                await pool.request()
                    .input("CertificationType", certificationType)
                    .input("EquipmentName", equipmentName)
                    .input("EquipmentType", equipmentType)
                    .input("VerificationResult", verificationResult)
                    .input("DateCert", dateCert)
                    .input("Comments", comments)
                    .input("CertificationName", cert)
                    .query(`
                        INSERT INTO tblCertifications (
                            QAID,
                            [Created By],
                            [Created On],
                            [Certification Type],
                            [Equipment Name],
                            [Equipment Type],
                            [Verification Result],
                            [Date Certification],
                            Comments,
                            [Certification Name],
                            [Archive]
                        )
                        VALUES (
                            12022,
                            'Eli',
                            GETDATE(),
                            @CertificationType,
                            @EquipmentName,
                            @EquipmentType,
                            @VerificationResult,
                            @DateCert,
                            @Comments,
                            @CertificationName,
                            0
                        )
                    `);
            }

            return res.json({ message: "QA records created successfully." });
        } else {
            const nameToUpdate = Array.isArray(certifications)
                ? certifications[0]
                : certificationName;

            await request
            .input("CertificationName", nameToUpdate)
            .query(`
                UPDATE tblCertifications
                SET
                    [Certification Type] = @CertificationType,
                    [Equipment Name] = @EquipmentName,
                    [Equipment Type] = @EquipmentType,
                    [Verification Result] = @VerificationResult,
                    [Date Certification] = @DateCert,
                    Comments = @Comments
                WHERE [Certification Name] = @CertificationName
            `);

        return res.json({ message: "QA record updated successfully" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Database Error" });
    }
})

module.exports = router;