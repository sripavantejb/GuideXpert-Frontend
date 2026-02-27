import { GenericCardSkeleton } from './CardSkeleton';

/**
 * Grid of card skeletons for admin Announcements list (2 columns).
 */
export default function AnnouncementsListSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <GenericCardSkeleton key={i} lines={3} />
      ))}
    </div>
  );
}
