document.addEventListener("DOMContentLoaded", () => {
    const adminTable = document.getElementById("admin-table");

    // Example data fetched from the server
    const transactions = [
        { user: "John Doe", date: "2024-11-20", amount: "$100", status: "Completed" },
        { user: "Jane Smith", date: "2024-11-15", amount: "$200", status: "Pending" },
    ];

    transactions.forEach((transaction) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.user}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.status}</td>
        `;
        adminTable.appendChild(row);
    });
});
