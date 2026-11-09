/**
 * /admin/projects — list (table on desktop, cards on mobile) with search, category
 * filter, drag-to-reorder and visibility toggles; add/edit in a drawer; delete with confirmation
 * (the server also deletes the project's thumbnail + gallery files from GridFS).
 */
import { FiFolder } from 'react-icons/fi';
import ResourceManager from '../components/ResourceManager';
import ProjectForm from '../forms/ProjectForm';
import { projectColumns } from '../components/resourceColumns';
import { resourceApi } from '../../services/adminApi';

const searchText = (p) => [p.title, p.category, p.shortDescription, ...(p.techStack || [])].join(' ');
const categoryFilter = { label: 'Categories', getValue: (p) => p.category };

export default function ProjectsPage() {
  return (
    <ResourceManager
      title="Projects"
      description="Everything in the Projects section of your website."
      itemName="project"
      api={resourceApi.projects}
      columns={projectColumns}
      Form={ProjectForm}
      searchText={searchText}
      filter={categoryFilter}
      emptyIcon={FiFolder}
    />
  );
}
