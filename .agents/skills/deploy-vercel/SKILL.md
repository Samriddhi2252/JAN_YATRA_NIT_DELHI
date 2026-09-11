---
name: deploy-vercel
description: Safely deploy the current web project to Vercel. Use when the user asks to deploy, publish, ship, or create a production deployment.
---

# Vercel Deployment

Use this skill whenever the user asks to deploy the project to Vercel.

## Goal

Deploy the current project safely and verify that the deployment succeeds.

## Step 1 — Inspect the project

Before deploying:

- Inspect package.json.
- Determine the framework and build command.
- Check the current git status.
- Check whether the project already has Vercel configuration.
- Do not change deployment configuration unnecessarily.

## Step 2 — Check the project

Before deployment:

- Install dependencies only if required.
- Run the project's appropriate build/check command.
- Look for TypeScript, lint, or build errors.
- If there are obvious errors related to the requested changes, fix them before deploying when it is safe to do so.

## Step 3 — Environment variables

- Never expose secrets.
- Never print API keys or secret values.
- Check whether required environment variables are missing.
- If a required secret is unavailable, tell the user exactly which variable is missing without asking them to paste the secret into chat.

## Step 4 — Deploy

Use the project's existing Vercel setup when available.

Prefer the established deployment method for the repository rather than creating a new configuration.

If Vercel CLI is already configured and available, use it appropriately.

Do not create a second Vercel project unless explicitly requested.

## Step 5 — Verify

After deployment:

- Confirm that the deployment completed successfully.
- Check the resulting deployment URL.
- If possible, verify that the deployed application loads.
- Check for obvious runtime or build errors.

## Step 6 — Report

After deployment, provide:

1. Whether deployment succeeded.
2. The deployment URL if available.
3. Any warnings or unresolved issues.
4. A short summary of what was deployed.

Never claim successful deployment unless the deployment result was actually verified.