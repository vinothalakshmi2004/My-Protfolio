/** Admin 404 — unknown /admin/* path. */
import { Link } from 'react-router-dom';
import { FiCompass } from 'react-icons/fi';
import { EmptyState } from '../components/Feedback';
import Button from '../components/Button';

export default function AdminNotFound() {
  return (
    <EmptyState
      icon={FiCompass}
      title="Page not found"
      description="This admin page doesn't exist."
      action={
        <Button as={Link} to="/admin">
          Back to overview
        </Button>
      }
    />
  );
}
