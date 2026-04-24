<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3a4b8b2f-9074-4ba1-8c19-27ccc11e105c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `ANTHROPIC_API_KEY` in [`.env`](.env) (or copy from [`.env.example`](.env.example)) for workflow and Tools generation. The legacy `ANTRHOPIC_API_KEY` typo is still read if the canonical name is unset.
3. Run the app:
   `npm run dev`
