# BGG API Registration - Copy/Paste Answers

---

### Describe your organization's (or your own) activities as they relate to BoardGameGeek and your use of the XML API.

I'm a board game fan and software developer. I built a small web app as a personal gift for a tiny local board game cafe. Before this app, they managed their entire game library using a PDF file. The app lets their visitors browse the cafe's game collection in a nicer way. It's a hobby project, completely free, and I don't make any money from it.

---

### Detailed description of your application(s), and how you will use our API

The app uses the BGG XML API in one place: an admin page where the cafe owner can search for a board game by name and add it to their collection. When they search, the app calls the `/xmlapi2/search` endpoint to find matching games, then `/xmlapi2/thing` to pull in details like player count, play time, description, and thumbnail image. That's it — just search and game details for adding new games. Very low volume, maybe a handful of searches per week at most.

---

### Is your application available to the public?

Yes

---

### Your API client(s), comma separated list, if any

brads-lime.vercel.app

---

### Is your endeavor commercial in nature?

No

---

### Please add any other information you think would be useful for us in evaluating your request for XML API access.

This is a tiny passion project I made as a gift for a small board game cafe. There's no monetization, no ads, no commercial angle at all. The API usage is extremely minimal — just the occasional search when the cafe owner adds a new game to their shelf. I'd really appreciate access so I can get this working again for them. Thanks!
