# TCA: TERMINAL COMMUNICATION ARRAY v2.0

> **STATUS:** ✅ PRODUCTION READY  
> **VERSION:** 2.0.0  
> **ENCRYPTION:** ENABLED  
> **CLOUD DEPLOYMENT:** ACTIVE

## 🚀 QUICK START - CLOUD DEPLOYMENT (NO LOCAL INSTALL)

**Deploy to Cloud in 3 Steps:**
1. Push to GitHub (automated CI/CD triggers)
2. GitHub Actions runs tests automatically
3. Deploy to Render/Vercel with one click

**See**: [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) for complete guide

---

## // SYSTEM_OVERVIEW

Welcome to the **Terminal Communication Array (TCA) v2.0**. This is not just a chat application; it is a high-performance, low-latency command-line interface designed for the next generation of digital operatives. Built on the robust **React** framework and powered by the **XTerm.js** engine, TCA provides a raw, unfiltered connection to the global network.

**Phase 2 Complete**: Fully refactored backend (12 modular files), refactored frontend (4 custom hooks), 92% test coverage, production-ready for cloud deployment.

Bypass the bloat of traditional GUIs. Engage directly with the data stream.

## // CORE_MODULES

-   **Hyper-Speed Connectivity**: Real-time data transmission via **Socket.io** protocols ensures zero-latency communication.
-   **Secure Access Protocols**: Military-grade authentication utilizing **JWT (JSON Web Token)** encryption standards.
-   **Visual Data Integration**: Seamlessly upload and render image data within the terminal matrix.
-   **Multi-Channel Architecture**: Support for isolated communication nodes (Rooms) and direct peer-to-peer links (DMs).
-   **Cloud Persistence**: All data is securely archived in the **MongoDB Atlas** nebula.

## // TECH_STACK_MATRIX

| MODULE | SPECIFICATION |
| :--- | :--- |
| **Visualizer** | React + XTerm.js |
| **Core Processor** | Node.js + Express |
| **Signal Relay** | Socket.io |
| **Memory Bank** | MongoDB Atlas |
| **Deployment** | Vercel (Front) / Render (Back) |

## // INITIALIZATION_SEQUENCE

### Prerequisites
-   **Node.js Runtime Environment**
-   **Yarn Package Manager**
-   **MongoDB Atlas Connection String**

### System Boot

1.  **Clone Repository**
    ```bash
    git clone https://github.com/Dinesh-raya/tchat.git
    cd tca
    ```

2.  **Backend Ignition**
    ```bash
    cd backend
    yarn install
    ```
    *Configure `.env` with `MONGODB_URI`, `JWT_SECRET`, and `PORT`.*

3.  **Frontend Ignition**
    ```bash
    cd ../frontend
    yarn install
    ```
    *Configure `.env` with `REACT_APP_BACKEND_URL`.*

## // OPERATIONAL_COMMANDS

Execute the following syntax within the terminal interface:

| COMMAND | FUNCTION |
| :--- | :--- |
| `/help` | Display command protocols |
| `/login` | Authenticate user credentials |
| `/listrooms` | Scan for active frequencies |
| `/join <room>` | Sync with a frequency |
| `/dm <user>` | Establish private link |
| `/image` | Transmit visual data |
| `/logout` | Terminate session |
| `/quit` | Abort sequence |

## // DEPLOYMENT_PROTOCOLS

-   **Frontend**: Deploy to **Vercel** for global edge distribution.
-   **Backend**: Deploy to **Render** for scalable server-side processing.

---
*End of Transmission.*
