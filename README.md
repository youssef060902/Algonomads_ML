# Breast Cancer Prediction System  
### Academic Project – 4th Year Data Science (ESPRIT)

## 📌 Project Overview
This project is an **academic project developed at ESPRIT** as part of the **4th-year Data Science curriculum**.  
It focuses on **breast cancer diagnosis and prognosis** using machine learning and deep learning techniques, following the **CRISP-DM methodology**.

The project addresses **three Data Science Objectives (DSOs)**:
1. **Breast Cancer Diagnosis**: Prediction of **malignant vs. benign** tumors  
2. **Tumor Stage Prediction**  
3. **Recurrence Risk Prediction** (probability of cancer returning)

---

## 👥 Project Team
Developed by:
- **Tasnim Benhassine**
- **Mohamed Youssef Azzouz**
- **Mohamed Aziz Trabelsi**
- **Rabeb Bougatef**
- **Yasmine Askri**
- **Wiem Mhadhbi**

---

## 🧠 Methodology: CRISP-DM

This project follows the **CRISP-DM (Cross-Industry Standard Process for Data Mining)** methodology, which is a structured approach for data science projects.

**CRISP-DM consists of six main phases:**
1. Business Understanding  
2. Data Understanding  
3. Data Preparation  
4. Modeling  
5. Evaluation  
6. Deployment  

Each phase is clearly implemented and documented in the notebooks.

---

## 📓 Notebooks Structure

The project notebooks are organized according to the **CRISP-DM phases**.

### 1️⃣ Business Understanding
- Definition of the medical problem
- State of the art on breast cancer prediction
- Business objectives and medical context
- Definition of the **three DSOs**

### 2️⃣ Data Understanding
- Description of the datasets used
- Analysis of features and target variables
- Class distribution and correlations
- Identification of potential data issues

### 3️⃣ Data Preparation
- Data cleaning and preprocessing
- Feature scaling using **Standardization**
- Handling class imbalance using **SMOTE** (applied to all three DSOs)
- DSO-specific preprocessing pipelines

### 4️⃣ Modeling
Different models were tested for each DSO:

#### 🔹 DSO1 – Malignant vs Benign Prediction
- Logistic Regression (baseline)
- Linear Regression
- SVM
- Softmax
- GRU-SVM
- MLP
- KNN

#### 🔹 DSO2 – Tumor Stage Prediction
- Logistic Regression
- Random Forest
- XGBoost
- Softmax

#### 🔹 DSO3 – Recurrence Risk Prediction
- Random Forest
- XGBoost
- Logistic Regression
### 5️⃣ Evaluation
- Evaluation of all models
- Comparison based mainly on **Accuracy**
- Selection of best-performing models for deployment

### 6️⃣ Deployment (Model Selection)
Final selected models:
- **DSO1**: MLP – Accuracy **99.12%**
- **DSO2**: Random Forest – Accuracy **97.89%**
- **DSO3**: Random Forest – Accuracy **87.91%**

The **project-integration** is an **integration notebook** that combines all DSOs.

---

## 🌐 Web Application Deployment

After selecting the best models, a **full web deployment** was implemented.

### 🔙 Backend – FastAPI
- Models and scalers saved using **Joblib**
- Backend developed with **FastAPI**
- Three REST API endpoints:
  - `/predict` → Tumor diagnosis
  - `/stage` → Tumor stage prediction
  - `/risk` → Recurrence risk prediction

To run the backend:
```bash
uvicorn main:app --reload
```
###  Frontend – Next.js

The frontend of the application was developed using **Next.js**, chosen for its performance, scalability, and built-in support for responsive design.  
The goal was to build a **modern, ergonomic, and responsive interface** that works seamlessly on both **web and mobile devices**.

####  User Interface & UX
- Clean and intuitive design adapted for medical professionals
- Responsive layout for desktop, tablet, and mobile
- Focus on usability and clarity of medical information

#### 🔐 Authentication & Roles
The application implements **role-based access control**, aligned with the business understanding phase:

- **Pathologist**
  - Access to **Recurrence Risk Prediction** (`/risk`)
- **Oncologist**
  - Access to **Tumor Diagnosis** (`/predict`)
  - Access to **Tumor Stage Prediction** (`/stage`)

During login, the user must first **select their role**, then authenticate using one of the following methods:
- **Email and password**
- **Medical License Number + Institution/Hospital**

####  Prediction Workflow
For each prediction page, the user can choose between **two input methods**:
1. **Manual data entry** using interactive sliders and form fields  
2. **CSV file upload** containing patient data  

After submission, the frontend sends the data to the corresponding **FastAPI endpoint** and displays the prediction results clearly to the user.

####  Running the Frontend
To start the Next.js application locally:
```bash
npm install
npm run dev
