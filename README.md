# Therion

| 23/11/2025 | version 0.1 | Rachel Tang | [Therion](#therion)
- [Therion](#therion)
  - [Purpose](#purpose)
  - [Codebase Architecture](#codebase-architecture)
    - [Backend (`backend/`)](#backend-backend)
    - [Frontend (`frontend/`)](#frontend-frontend)
  - [Setting Up the Codebase Locally](#setting-up-the-codebase-locally)
    - [1. Clone the repository](#1-clone-the-repository)
    - [2. Change into the repository folder](#2-change-into-the-repository-folder)
    - [3. Change directories into the `backend/` folder](#3-change-directories-into-the-backend-folder)
    - [4. Create and activate the virtual environment:](#4-create-and-activate-the-virtual-environment)
    - [5. Install packages in the `requirements.txt` file](#5-install-packages-in-the-requirementstxt-file)
    - [6. Run the backend server](#6-run-the-backend-server)
    - [7. Now, on another terminal, switch directories into the `frontend/` folder.](#7-now-on-another-terminal-switch-directories-into-the-frontend-folder)
    - [8. Install frontend dependencies](#8-install-frontend-dependencies)
    - [9. Run the frontend application](#9-run-the-frontend-application)

## Purpose

This document provides instructions for installing, configuring, and running the Therion Platform on a local machine.

---

## Codebase Architecture

The Therion Platform consists of two major components: the backend (FastAPI) and the frontend (React/Next.js). The structure is outlined below.

### Backend (`backend/`)

Contains server-side logic including API endpoints and pipeline processing.

- `example_inputs/` — Sample sequence inputs  
- `step1_epitope_prediction/` — Step 1 implementation  
- `step2_conservancy_analysis/` — Step 2 implementation  
- `step3_antigenicity_screening/` — Step 3 implementation  
- `step4_allergenicity_screening/` — Step 4 implementation  
- `step5_toxicity_screening/` — Step 5 implementation  
- `step6_cytokine_analysis/` — Step 6 implementation  
- `step7_population_coverage/` — Step 7 implementation  
- `main.py` — Main FastAPI application

### Frontend (`frontend/`)

Contains the client-facing interface and all UI logic.

- `public/` — Static files (images, icons)  
- `src/` — Source code for UI logic  
  - `app/` — Page-level logic  
    - `results/` — Results page  
    - `page.tsx` — Landing page and pipeline configuration  
  - `components/` — Reusable UI components  
  - `lib/` — Shared utility logic  


<br>

## Setting Up the Codebase Locally

**Prerequisite:** Ensure Node.js (v18.17 or higher) and Python (v3.10) are installed.

### 1. Clone the repository

```bash
$ git clone <repository-url>
```
### 2. Change into the repository folder

```bash
$ cd <repository-folder-name>
```

### 3. Change directories into the `backend/` folder

```bash
$ cd backend/
```

### 4. Create and activate the virtual environment:
  
For Windows users:

```bash
$ python -m venv venv
$ .\venv\Scripts\activate
```

For Mac users:
```bash
$ python -m venv .venv
$ source .venv/bin/activate
```

### 5. Install packages in the `requirements.txt` file

For Windows users:

```bash
$ pip install -r requirements.txt
```

For Mac users:
```bash
$ pip3 install -r requirements.txt
```

### 6. Run the backend server

For Windows users:

```bash
$ python main.py
```

For Mac users:
```bash
$ python3 main.py
```

### 7. Now, on another terminal, switch directories into the `frontend/` folder.

```bash
$ cd frontend/
```

### 8. Install frontend dependencies

```bash
$ npm install
```

### 9. Run the frontend application

```bash
$ npm run dev
```

The application should now be running on _http://localhost:3000_.
<br> 
