import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { limiter } from '../config/limiter';
import { autenticate } from '../middleware/auth';

const router = Router();

router.use(limiter);

//*create-account
router.post(
  '/create-account',
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('El password es muy corto, mínimo 8 caracteres'),
  body('email').isEmail().withMessage('El email no es valido'),
  handleInputErrors,
  AuthController.createAccount,
);

//*confirm-account
router.post(
  '/confirm-account',
  body('token')
    .notEmpty()
    .isLength({
      min: 6,
      max: 6,
    })
    .withMessage('Token no válido'),
  handleInputErrors,
  AuthController.confirmAccount,
);

//*login
router.post(
  '/login',
  body('email').isEmail().withMessage('Email no válido'),
  body('password').notEmpty().withMessage('El password es obligatorio'),
  handleInputErrors,
  AuthController.login,
);

//*forgot-password
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Email no válido'),
  handleInputErrors,
  AuthController.forgotPassword,
);

//*validate-token
router.post(
  '/validate-token',
  body('token')
    .notEmpty()
    .isLength({
      min: 6,
      max: 6,
    })
    .withMessage('Token no válido'),
  handleInputErrors,
  AuthController.validateToken,
);

//*reset-password
router.post(
  '/reset-password/:token',
  param('token')
    .notEmpty()
    .isLength({
      min: 6,
      max: 6,
    })
    .withMessage('Token no válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('El password es muy corto, mínimo 8 caracteres'),
  handleInputErrors,
  AuthController.resetPasswordWithToken,
);

//*user
router.get('/user', autenticate, AuthController.getUser);

//*update-password
router.post(
  '/update-password',
  autenticate,
  body('currentPassword')
    .notEmpty()
    .withMessage('El password actual no puede ir vacio'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('El password nuevo es muy corto, mínimo 8 caracteres'),
  handleInputErrors,
  AuthController.updateCurrentUserPassword,
);

//*check-password
router.post(
  '/check-password',
  autenticate,
  body('password').notEmpty().withMessage('El password no puede ir vacio'),
  handleInputErrors,
  AuthController.checkPassword,
);

export default router;
