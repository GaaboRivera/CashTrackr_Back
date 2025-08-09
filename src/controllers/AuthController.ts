import { Response, Request } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //Prevenir duplicados
    const userExists = await User.findOne({
      where: {
        email,
      },
    });

    if (userExists) {
      const error = new Error('El usuario ya existe');
      return res.status(409).json(error.message);
    }
    try {
      const user = new User(req.body);

      user.password = await hashPassword(password);
      user.token = generateToken();

      await user.save();

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.status(201).json('Cuenta creada correctamente');
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findOne({
      where: {
        token,
      },
    });

    if (!user) {
      const error = new Error('Token no válido');
      return res.status(401).json({ error: error.message });
    }

    user.confirmed = true;
    user.token = null;

    await user.save();
    res.json('Cuanta confirmada correctamente');
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    //Revisar que el usuario exista
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      const error = new Error('Usuario no encontrado');
      return res.status(404).json(error.message);
    }

    if (!user.confirmed) {
      const error = new Error('La cuenta no ha sido confirmada');
      return res.status(403).json(error.message);
    }

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error('Password incorrecto');
      return res.status(401).json(error.message);
    }

    const token = generateJWT(user.id);

    res.json(token);
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    //Revisar que el usuario exista
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      const error = new Error('Usuario no encontrado');
      return res.status(404).json(error.message);
    }

    user.token = generateToken();
    await user.save();

    await AuthEmail.sendPasswordResetToken({
      name: user.name,
      email: user.email,
      token: user.token,
    });

    res.json('Revisa tu email para instrucciones');
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    const tokenExists = await User.findOne({ where: { token } });

    if (!tokenExists) {
      const error = new Error('Token no válido');
      return res.status(404).json(error.message);
    }

    res.json('Token correcto...');
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        token,
      },
    });

    if (!user) {
      const error = new Error('Token no válido');
      return res.status(409).json(error.message);
    }

    user.password = await hashPassword(password);
    user.token = null;

    await user.save();

    res.json('El password se modificó correctamente');
  };
}
