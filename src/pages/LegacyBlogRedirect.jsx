import { Navigate, useParams } from 'react-router-dom';

export default function LegacyBlogRedirect() {
  const { id } = useParams();
  if (!id) return <Navigate to="/blogs" replace />;
  return <Navigate to={`/blogs/${encodeURIComponent(id)}`} replace />;
}

