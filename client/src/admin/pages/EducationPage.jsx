/** /admin/education — degrees and schools (list, add, edit, delete, reorder, hide). */
import { FiBookOpen } from 'react-icons/fi';
import ResourceManager from '../components/ResourceManager';
import EducationForm from '../forms/EducationForm';
import { educationColumns } from '../components/resourceColumns';
import { resourceApi } from '../../services/adminApi';

export default function EducationPage() {
  return (
    <ResourceManager
      title="Education"
      description="Degrees, schools and scores."
      itemName="education entry"
      api={resourceApi.education}
      columns={educationColumns}
      Form={EducationForm}
      getTitle={(e) => e.degree}
      emptyIcon={FiBookOpen}
    />
  );
}
