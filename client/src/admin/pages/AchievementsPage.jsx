/** /admin/achievements — awards and honours (list, add, edit, delete, reorder, hide). */
import { FiStar } from 'react-icons/fi';
import ResourceManager from '../components/ResourceManager';
import AchievementForm from '../forms/AchievementForm';
import { achievementColumns } from '../components/resourceColumns';
import { resourceApi } from '../../services/adminApi';

export default function AchievementsPage() {
  return (
    <ResourceManager
      title="Achievements"
      description="Awards, competitions and recognitions."
      itemName="achievement"
      api={resourceApi.achievements}
      columns={achievementColumns}
      Form={AchievementForm}
      searchText={(a) => `${a.title} ${a.description}`}
      emptyIcon={FiStar}
    />
  );
}
