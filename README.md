# Ilu-app

## Problem

Remittances are fundamental for Oaxaca’s economy, providing well-being and development to many families. However, there are significant barriers to accessing and making the most of this resource:

- **High commission fees** in traditional services.  
- **Limited accessibility**, since many people must physically travel to branches to receive payments.  
- **Lack of credit history**, which hinders financial inclusion, as conventional transfers do not generate useful records for this purpose.  

## Technology Used

### Backend
- **Node.js** (ES Modules)  
- **Express.js**  
- **@interledger/open-payments** (for Open Payments integration)  
- **Libraries:** CORS, dotenv, uuid, qrcode  

### Frontend
- **React 18** + **Vite**  
- **Bootstrap 5**  
- **Lucide React** (icons)  
- **Axios** (HTTP client)  

## Solution

**Ilu** is an application that facilitates the reception and management of remittances and digital payments, promoting circular economy and financial inclusion in Oaxaca. It leverages Open Payments to reduce fees and generate digital credit history, in addition to featuring a virtual assistant for financial education.  

### Key Features

- Online remittance reception, without the need to visit branches.  
- Digital credit history.  
- Lower fees thanks to Open Payments.  
- Universal accessibility from any internet-enabled device.  
- Financial education through a virtual assistant for smart saving.  

## Benefits

- **Cost reduction** for users receiving remittances.  
- **Greater accessibility**: usable from anywhere, without travel.  
- **Credit history generation** to promote financial inclusion.  
- **Ease of use** thanks to a user-friendly interface and educational support.  
- **Promotion of circular economy** in Oaxaca.  

## Simple Architecture/Stack

Frontend (React + Vite + Bootstrap)
|
v
Backend (Node.js + Express + Open Payments)
|
v
Open Payments / Interledger Services

markdown
Copiar código

- The **frontend** communicates with the **backend** via REST API.  
- The **backend** manages users, transactions, and business logic, and connects to the open payments network.  
- The infrastructure aims to be scalable and secure, clearly separating the presentation layer from business logic.  

## Essential Features

- **User dashboard**: balance, transactions, and statistics visualization.  
- **Money transfer and reception**: digital transfers between users.  
- **Transaction history/recent transactions view**.  
- **Automatic credit history generation**.  
- **Recommendations and financial education** via virtual assistant.  
- **Notification and alert management**.  
- **User authentication and security**.  
- **Integration with Open Payments** for low fees and open standards.  

## Responsibilities

| Name                  | Role / Responsibility                                      |
|-----------------------|-------------------------------------------------------------|
| Valentina León Hernandez | General leadership, architecture, Open Payments backend    |
| Saúl Abigael Guerra Rivas| Main frontend, UX/UI integration                          |
| Nahum Santa Ana Ceballos | Frontend developer, documentation                         |
| Abraham Reyes Castillo   | Backend developer, AI simulation integration              |

> *The table must be updated with the actual names and roles of the team.*  

---

## Project Objective

Develop a web platform that allows users to receive, manage, and make use of their remittances digitally, reducing costs and fostering the creation of a credit history.  

### Specific Objectives

- Provide a simple and accessible user experience.  
- Ensure data security and privacy.  
- Promote financial inclusion.  
- Facilitate integration of digital payments with open standards.  
- Boost the circular economy in the region.  

---

## Hackathon Open Payments – Interledger  
**Team:** Code Spartans: ILU  
**Project:** Ilu-app  
