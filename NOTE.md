# Notes

- 2026-09-09: When making an app, be direct. Ask AI that is clear and direct — e.g. "Instead of 'make a react website that has no mistakes,'" or "'Implement #123. Mockup: url.com. If the mockup and ticket disagree, favor the mockup.'" On occasion you will not be able to fix a ticket with AI. When you get a large ticket, the context limit may overcome it.
- Claude.md file is a linting rule and will protect ai for rewriteing the code.

---

# Prompts

A chronological log of the prompts/requests given during the build of this app (the "Meme Hall of Fame" project). Question-answer entries are responses given to Claude's clarifying questions during planning; everything else is a directly typed message.

1. **Initial request:** "Help me create a website that uses react to build it."

2. **Answer — What is this website for?:** "Make a website for the hall of fame for dank memes. I want to be able to add videos and photos to it and order what memes are in there.... Let me choose what routers and css options I want"

3. **Answer — Which React tooling/framework?:** "Vite + React (Recommended)"

4. **Answer — Language and styling preferences?:** "TypeScript + Tailwind CSS"

5. **Answer — Which router setup?:** "tanstack router"

6. **Answer — How should meme data be stored?:** "Not sure — you decide"

7. **Plan feedback (rejected initial ExitPlanMode):** "Inform me when something that is imprtant is needed to be edited"

8. **Answer — how should that check-in work for this project?:** "Option 1 and when something expensive is required to be made."

9. **Answer — Ready for me to scaffold the project now?:** "Yes, go ahead"

10. **Answer — Proceed with npm install + Tailwind/TanStack Router/dnd-kit/idb-keyval + config wiring?:** "Yes, install everything now"

11. **Answer — podium/banner add-on (from a stray background-agent notification):** "Yes, add the banner + podium layout"

12. "make the favicon the little trophy you have"

13. "Add verification where a user can make a login with their email. Make a backdoor admin being admin@admin.com and password being Admin123123"

14. **Answer — What should logging in control?:** "The login will gate deleteing memes to admins. Also anyone else logged into the site can request to add a meme to the hall of fame"

15. **Answer — How should regular (non-admin) accounts work?:** "Self serve sign up but admin can only be ran by a saved admin thats not able to be hacked and checking for a role is important but someone cant just change their account to admin"

16. "I need there to be a category for each meme to be showable to the user so if the meme is a dead meme it can have a category called \"Dead\" or if its pepe it can be called \"2016\" or whenever its made"

17. "make it so if I add a comma between each category that will allow another category to be attached to the meme. ALSO make a light and a dark mode toggle"

18. "Also add a search a meme bar." *(sent mid-turn, while the previous request was still being worked on)*

19. "Make pending and current memes editable by an admin"

20. "Add all my prompts to a markdown file" *(sent mid-turn; this request)*
