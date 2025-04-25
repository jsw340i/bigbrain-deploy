import Button from '@mui/material/Button';

function MyButton({ label, onClick }) {
  return <Button onClick={onClick}>{label}</Button>;
}

export default MyButton;