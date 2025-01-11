import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { 
  ApiResponse, 
  AccountResponse, 
  CreateAccountDto, 
  UpdateAccountDto,
  AccountWithRelations 
} from '../types';
import { getCalculatedFields } from '../utils/calculations';

// Get single account
export const getAccount = async (
  req: Request,
  res: Response<ApiResponse<AccountResponse>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        goals: true,
        notes: true,
        clientContacts: true,
      },
    }) as AccountWithRelations | null;

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      data: {
        ...account,
        website: account.website ?? null,
        linkedinProfile: account.linkedinProfile ?? null,
        ...getCalculatedFields(account)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all accounts
export const getAccounts = async (
  req: Request,
  res: Response<ApiResponse<AccountResponse[]>>,
  next: NextFunction
) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        goals: true,
        notes: true,
        clientContacts: true,
      },
    }) as AccountWithRelations[];

    const accountsWithCalculations = accounts.map((account: AccountWithRelations) => ({
      ...account,
      website: account.website ?? null,
      linkedinProfile: account.linkedinProfile ?? null,
      ...getCalculatedFields(account)
    }));

    res.json({ data: accountsWithCalculations });
  } catch (error) {
    next(error);
  }
};

// Create account
export const createAccount = async (
  req: Request<{}, {}, CreateAccountDto>,
  res: Response<ApiResponse<AccountResponse>>,
  next: NextFunction
) => {
  try {
    const accountData = {
      ...req.body,
      website: req.body.website ?? null,
      linkedinProfile: req.body.linkedinProfile ?? null,
    };

    const account = await prisma.account.create({
      data: accountData,
      include: {
        goals: true,
        notes: true,
        clientContacts: true,
      },
    }) as AccountWithRelations;

    res.status(201).json({
      data: {
        ...account,
        ...getCalculatedFields(account)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update account
export const updateAccount = async (
  req: Request<{ id: string }, {}, UpdateAccountDto>,
  res: Response<ApiResponse<AccountResponse>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const accountData = {
      ...req.body,
      website: req.body.website ?? null,
      linkedinProfile: req.body.linkedinProfile ?? null,
    };

    const account = await prisma.account.update({
      where: { id },
      data: accountData,
      include: {
        goals: true,
        notes: true,
        clientContacts: true,
      },
    }) as AccountWithRelations;

    res.json({
      data: {
        ...account,
        ...getCalculatedFields(account)
      }
    });
  } catch (error) {
    next(error);
  }
};