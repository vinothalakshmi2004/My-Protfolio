/**
 * SettingsPage — page shell for screens that edit the settings singleton.
 * Handles loading (skeleton) and error (retry) states, then renders
 * children(settings, save) once the data is available.
 */
import { FiAlertTriangle } from 'react-icons/fi';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { Card, EmptyState, PageHeader, SkeletonForm } from './Feedback';
import Button from './Button';

export const SettingsPage = ({ title, description, actions, children }) => {
  const { settings, loading, error, reload, save } = useAdminSettings();

  return (
    <div>
      <PageHeader title={title} description={description} actions={actions} />
      {loading ? (
        <Card className="p-4 sm:p-6">
          <SkeletonForm />
        </Card>
      ) : error ? (
        <EmptyState
          icon={FiAlertTriangle}
          title="Couldn't load settings"
          description={error}
          action={
            <Button variant="secondary" onClick={reload}>
              Try again
            </Button>
          }
        />
      ) : (
        children(settings, save)
      )}
    </div>
  );
};

export default SettingsPage;
