import { z } from 'zod';
import i18n from './i18n';

// 邮箱验证规则
export const emailSchema = z
  .string()
  .min(1, i18n.t('validation.email.required'))
  .regex(
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    i18n.t('validation.email.invalid')
  );

// 密码验证规则
export const passwordSchema = z
  .string()
  .min(8, i18n.t('validation.password.minLength', { count: 8 }))
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
    i18n.t('validation.password.requireAll')
  );

// 登录表单验证规则
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// 类型定义
export type LoginFormSchema = z.infer<typeof loginFormSchema>;

// 创建一个函数来获取最新的验证规则（考虑语言变化）
export const getValidationSchemas = () => ({
  emailSchema: z
    .string()
    .min(1, i18n.t('validation.email.required'))
    .regex(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      i18n.t('validation.email.invalid')
    ),

  passwordSchema: z
    .string()
    .min(8, i18n.t('validation.password.minLength', { count: 8 }))
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
      i18n.t('validation.password.requireAll')
    ),

  loginFormSchema: z.object({
    email: emailSchema,
    password: passwordSchema,
  })
});

// 示例使用：
/*
import { getValidationSchemas, type LoginFormSchema } from './validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

const YourComponent = () => {
  const { t } = useTranslation();
  const { loginFormSchema } = getValidationSchemas();

  const { control, handleSubmit } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });
};
*/ 