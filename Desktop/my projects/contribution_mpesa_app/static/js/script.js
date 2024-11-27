document.addEventListener("DOMContentLoaded", () => {
    const contributionsTable = document.getElementById("contributions-table");

    // Example data fetched from the server
    const contributions = [
        { date: "2024-11-20", amount: "$100", status: "Completed", balance: "$900" },
        { date: "2024-11-15", amount: "$200", status: "Pending", balance: "$800" },
    ];

    contributions.forEach((contribution) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${contribution.date}</td>
            <td>${contribution.amount}</td>
            <td>${contribution.status}</td>
            <td>${contribution.balance}</td>
        `;
        contributionsTable.appendChild(row);
    });
});
