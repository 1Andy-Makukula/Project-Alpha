<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1U4z7Tar-JrVX_J-7luIvuA1sUgJ6oCOb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Documentation

*   [**Feature Implementation Guide**](./docs/FEATURE_IMPLEMENTATION_GUIDE.md): Overview of implemented features and future roadmap.
*   [**Backend Integration Guide**](./docs/BACKEND_INTEGRATION_GUIDE.md): Detailed API specifications and data models for the backend team.

## Key Features (KithLy Concierge)

*   **Zone-Based Delivery:** Dynamic pricing based on distance.
*   **Manual Dispatch Workflow:** Shop -> Admin -> Driver flow.
*   **Pin Location:** Recipients can pin their exact location for drivers.
