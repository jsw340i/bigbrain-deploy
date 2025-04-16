import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditQuestion() {
  <>
    <h2>Edit Question</h2>
    <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>Go Back</Button><br />
  </>
}

export default EditQuestion;
