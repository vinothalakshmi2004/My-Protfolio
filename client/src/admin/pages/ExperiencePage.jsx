/** /admin/experience — work history (list, add, edit, delete, reorder, hide). */
import { FiBriefcase } from 'react-icons/fi';
import ResourceManager from '../components/ResourceManager';
import ExperienceForm from '../forms/ExperienceForm';
import { experienceColumns } from '../components/resourceColumns';
import { resourceApi } from '../../services/adminApi';

export default function ExperiencePage() {
  return (
    <ResourceManager
      title="Experience"
      description="Your work history timeline."
      itemName="experience"
      api={resourceApi.experience}
      columns={experienceColumns}
      Form={ExperienceForm}
      getTitle={(e) => `${e.role} — ${e.company}`}
      searchText={(e) => `${e.role} ${e.company} ${e.location}`}
      emptyIcon={FiBriefcase}
    />
  );
}
