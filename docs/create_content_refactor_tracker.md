# Create Content Composer Refactor Tracker

## Scope

Upgrade the Profile Create flow into a professional creator composer with two publishing destinations:

- Foodie Feed Post (regular post)
- Discover Reel (video-first)

## Phase Tracking

| Phase | Goal                                    | Status    | Notes                                                                                                        |
| ----- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| 1     | Product clarity and naming polish       | Completed | Updated Profile and modal copy to "Create Content", plus clear Foodie Feed vs Discover destination labels    |
| 2     | Split composer by intent (Post vs Reel) | Completed | Added distinct Post/Reel form blocks with mode-specific validation and publish buttons                       |
| 3     | Data contract hardening                 | Completed | Added typed request/response DTOs and strict response-id checks for post/reel publish APIs                   |
| 4     | Visual layout polish                    | Completed | Upgraded composer layout with scroll-safe shell, clearer sectioning, and dynamic live preview panel          |
| 5     | Creator workflow enhancements           | Completed | Added in-composer media uploads for post/reel/thumbnail; draft persistence intentionally deferred by request |

## Delivery Checklist

- [x] Phase 1 complete
- [x] Phase 2 complete
- [x] Phase 3 complete
- [x] Phase 4 complete
- [x] Phase 5 upload ergonomics complete (no draft persistence)
- [x] TypeScript check for touched files
- [x] Tracker updated with outcomes

## Outcomes (Current)

- Post mode now publishes to `/api/v1/posts` with review-first fields for Foodie Feed.
- Reel mode now publishes to `/api/v1/reels` with `title`, `video_url`, and optional `thumbnail_url` for Discover.
- Footer CTA and disabled state are now dynamic per content type.
- Profile success message now reflects the actual destination (Foodie Feed vs Discover).
- Callback contract is now event-based (`type`, `destination`, `id`, `createdAt`) for safer downstream handling.
- URL validation now blocks invalid media URLs before submission.
- Composer now uses a scroll-safe modal body and responsive grid composition with preview.
- Composer now supports direct media uploads (post cover image, reel video, reel thumbnail) and auto-fills URL fields from upload responses.
- Publish action is now blocked while uploads are running to avoid incomplete submissions.
