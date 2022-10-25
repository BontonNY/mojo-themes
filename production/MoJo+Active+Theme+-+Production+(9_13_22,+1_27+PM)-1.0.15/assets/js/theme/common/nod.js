import nod from 'nod-validate';
import minMaxValidate from './nod-functions/min-max-validate';

// Hook our SCSS framework form field status classes into the nod validation system before use
nod.classes.errorClass = 'invalid';
nod.classes.successClass = 'vaild';
nod.classes.errorMessageClass = 'invalid_msg';

// Register validate functions
nod.checkFunctions['min-max'] = minMaxValidate;

export default nod;
