import ListSkeleton from './ListSkeleton';

/**
 * Feed-style skeleton for counsellor AnnouncementsFeed: list rows with avatar + lines.
 */
export default function FeedSkeleton() {
  return (
    <div className="space-y-4">
      <ListSkeleton rows={5} avatar={true} />
    </div>
  );
}
