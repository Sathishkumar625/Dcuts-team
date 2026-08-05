const API_URL = "http://localhost:5000/api";

let quotations = [];
let clients = [];
let editingQuotationId = null;

// ==========================
// Load Clients
// ==========================

async function loadClients() {

    try {

        const res = await fetch(`${API_URL}/clients`);
        const result = await res.json();

        clients = result.data || [];

        const select = document.getElementById("clientId");

        select.innerHTML = `<option value="">Select Client</option>`;

        clients.forEach(client => {

            select.innerHTML += `
                <option value="${client._id}">
                    ${client.clientName}
                </option>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}
function addServiceRow() {

    const tbody = document.getElementById("serviceBody");

    tbody.innerHTML += `

    <tr>

        <td>
            <input
                class="serviceName"
                type="text">
        </td>

        <td>
            <input
                class="qty"
                type="number"
                value="1"
                oninput="calculateGrandTotal()">
        </td>

        <td>
            <input
                class="price"
                type="number"
                value="0"
                oninput="calculateGrandTotal()">
        </td>

        <td>
            <input
                class="amount"
                type="number"
                readonly>
        </td>

        <td>

            <button
                onclick="removeService(this)">

                ❌

            </button>

        </td>

    </tr>

    `;

}
function removeService(button) {

    button.parentElement.parentElement.remove();

    calculateGrandTotal();

}
function calculateGrandTotal() {

    let subtotal = 0;

    document
        .querySelectorAll("#serviceBody tr")
        .forEach(row => {

            const qty =
                Number(row.querySelector(".qty").value);

            const price =
                Number(row.querySelector(".price").value);

            const amount = qty * price;

            row.querySelector(".amount").value = amount;

            subtotal += amount;

        });

    const discount =
        Number(document.getElementById("discount").value);

    const tax =
        Number(document.getElementById("tax").value);

    const grandTotal =
        subtotal - discount + tax;

    document.getElementById("grandTotal").value =
        grandTotal;

}
async function saveQuotation() {

    const services = [];

    document
        .querySelectorAll("#serviceBody tr")
        .forEach(row => {

            services.push({

                serviceName:
                    row.querySelector(".serviceName").value,

                quantity:
                    Number(row.querySelector(".qty").value),

                price:
                    Number(row.querySelector(".price").value),

                amount:
                    Number(row.querySelector(".amount").value)

            });

        });

    const data = {

        clientId:
            document.getElementById("clientId").value,

        quotationDate:
            document.getElementById("quotationDate").value,

        validTill:
            document.getElementById("validTill").value,

        services,

        subtotal:
            services.reduce((a,b)=>a+b.amount,0),

        discount:
            Number(document.getElementById("discount").value),

        tax:
            Number(document.getElementById("tax").value),

        grandTotal:
            Number(document.getElementById("grandTotal").value)

    };

    try {

        await fetch(`${API_URL}/quotations`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(data)

        });

        alert("Quotation Saved Successfully");

        loadQuotations();

    } catch(err){

        console.log(err);

    }

}
document
.getElementById("addServiceBtn")
.addEventListener("click", addServiceRow);

document
.getElementById("saveQuotationBtn")
.addEventListener("click", saveQuotation);

document
.getElementById("discount")
.addEventListener("input", calculateGrandTotal);

document
.getElementById("tax")
.addEventListener("input", calculateGrandTotal);

document.addEventListener("DOMContentLoaded", () => {

    loadClients();

    addServiceRow();

});