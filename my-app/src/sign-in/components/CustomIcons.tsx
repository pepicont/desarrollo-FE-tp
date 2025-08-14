
//import SvgIcon from '@mui/material/SvgIcon';
import logoImage from '../../assets/logo.jpg';

export function SitemarkIcon() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%',
      marginBottom: '16px'
    }}>
      <img 
        src={logoImage} 
        alt="Logo de portal de videojuegos" 
        style={{ 
          width: '80px', 
          height: '80px',
          borderRadius: '8px',
          objectFit: 'cover'
        }} 
      />
    </div>
    );
}
