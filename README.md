Smart Recruit AI

An AI-driven Recruitment SaaS platform designed to automate and streamline the hiring process. This project focuses on solving the "Resume Overload" problem for recruiters by using AI to rank candidates based on job requirements.

Key Features

AI-Powered Resume Screening: Integrates OpenAI to analyze resumes and generate compatibility scores.

Smart Candidate Ranking: Automatically sorts applicants by their AI match score, helping recruiters find top talent faster.

Dual-Role Dashboards: Separate user experiences for Recruiters (job management) and Candidates (application tracking).

Secure Authentication: Seamless Google Login integration using NextAuth.js.

Payment Integration: Stripe support for featured job listings and premium recruiter tools.

🛠️ Tech Stack

Framework: Next.js 15 (App Router)

Language: TypeScript (for type safety and robust code)

Database: MongoDB with Mongoose ODM

Styling: Tailwind CSS & Shadcn UI

Validation: Zod (for bulletproof API request validation)

📂 Project Architecture

The project follows a clean MVC (Model-View-Controller) pattern within the src directory to ensure scalability:

src/models: Mongoose schemas for Users, Jobs, and Applications.

src/controllers: Business logic and AI-processing routines.

src/validations: Request schemas for data integrity.

src/lib: Database connections and utility helpers.

Why this is Professional:

Clear Problem Statement: You mentioned why the project exists (solving "Resume Overload").

Standard Terminology: Uses terms like "Scalability," "Type Safety," and "ODM."

Architecture Highlight: Shows that you didn't just write code, you designed it.