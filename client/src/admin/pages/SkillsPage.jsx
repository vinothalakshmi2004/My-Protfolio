/** /admin/skills — skill categories, each with a sortable list of skills. */
import { FiCode } from 'react-icons/fi';
import ResourceManager from '../components/ResourceManager';
import SkillForm from '../forms/SkillForm';
import { skillColumns } from '../components/resourceColumns';
import { resourceApi } from '../../services/adminApi';

export default function SkillsPage() {
  return (
    <ResourceManager
      title="Skills"
      description="Skill categories shown as cards on your website."
      itemName="skill category"
      api={resourceApi.skills}
      columns={skillColumns}
      Form={SkillForm}
      getTitle={(s) => s.category}
      searchText={(s) => `${s.category} ${(s.items || []).map((i) => i.name).join(' ')}`}
      emptyIcon={FiCode}
    />
  );
}
