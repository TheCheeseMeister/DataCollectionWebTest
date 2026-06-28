const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
console.log("API =", API);
console.log("FULL URL =", `${API}/api/verificationResult`);

    const handleInsert = async () => {
        try {
            const res = await fetch(`${API}/api/verificationResult`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    VerificationResult: "Test Value"
                })
            });
            
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();
            console.log("Inserted: ", data);
        } catch (err) {
            console.log("Error inserting: ", err)
        }
    };

    return (
        <div className="text-black">
            <p>
                Home
            </p>

            <button onClick={handleInsert}>
                Click to Insert
            </button>
        </div>
    );
}