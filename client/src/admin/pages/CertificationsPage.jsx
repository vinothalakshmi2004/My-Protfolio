/** /admin/certifications — certificates with image/PDF upload and credential links. */
import { FiAward } from 'react-icons/fi';
import ResourceManager from '../components/ResourceManager';
import CertificationForm from '../forms/CertificationForm';
import { certificationColumns } from '../components/resourceColumns';
import { resourceApi } from '../../services/adminApi';

export default function CertificationsPage() {
  return (
    <ResourceManager
      title="Certifications"
      description="Certificates (image or PDF) and verification links."
      itemName="certification"
      api={resourceApi.certifications}
      columns={certificationColumns}
      Form={CertificationForm}
      searchText={(c) => `${c.title} ${c.issuer}`}
      filter={{ label: 'Issuers', getValue: (c) => c.issuer }}
      emptyIcon={FiAward}
    />
  );
}
