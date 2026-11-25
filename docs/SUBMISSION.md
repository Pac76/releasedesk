# ReleaseDesk assessment handoff

Use this file as a copy checklist for the private submission form. Replace credential placeholders only in the form or another private channel. Never commit real credentials or the personal submission URL.

## Public links

- Application: <https://releasedesk-three.vercel.app/>
- Repository: <https://github.com/Pac76/releasedesk>

## Evaluator access — provide privately

- Email: `[ADD IN PRIVATE SUBMISSION FORM — DO NOT COMMIT]`
- Password: `[ADD IN PRIVATE SUBMISSION FORM — DO NOT COMMIT]`

## Four short answers

The assessment form has not exposed the four questions in this repository. Fill these only after opening the private form:

1. Question: `[COPY THE ACTUAL QUESTION PRIVATELY]`  
   Answer: `[WRITE THE ANSWER PRIVATELY]`
2. Question: `[COPY THE ACTUAL QUESTION PRIVATELY]`  
   Answer: `[WRITE THE ANSWER PRIVATELY]`
3. Question: `[COPY THE ACTUAL QUESTION PRIVATELY]`  
   Answer: `[WRITE THE ANSWER PRIVATELY]`
4. Question: `[COPY THE ACTUAL QUESTION PRIVATELY]`  
   Answer: `[WRITE THE ANSWER PRIVATELY]`

## External completion items

Complete and verify these before submission:

- [ ] Hosted migration applied to the intended Supabase project.
- [ ] Auth Site URL, redirect allowlist, and token-hash email template configured.
- [ ] Production environment contains only the public Supabase URL and publishable key.
- [ ] Dedicated evaluator account created and confirmed outside Git.
- [ ] Authenticated CRUD and a two-user isolation check passed.
- [ ] Latest `main` deployment is the production deployment.
- [ ] Vercel Authentication is disabled for production.
- [ ] App opens signed out in an incognito window without a platform login.
- [ ] CI and local quality commands pass.

Detailed owner steps: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

## Safe delivery note

ReleaseDesk uses an Orchestrator, a Develop implementation agent, and an independent read-only Testing agent. Truthful review evidence is linked from the repository README. Hosted Supabase verification remains external until the checklist above is completed; do not describe an unchecked item as passed.
