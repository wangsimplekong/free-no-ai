import { MemberPlan } from '../types/member.types';
import { UserBenefits } from '../types/auth.types';

export const calculatePricePerDay = (price: number, periodType: number): number => {
  // periodType: 1 = monthly, 2 = yearly
  const daysInPeriod = periodType === 1 ? 30 : 365;
  return price / daysInPeriod;
};

export const calculateUpgradePrice = (
  currentPlan: UserBenefits['membership'],
  targetPlan: MemberPlan
): number => {
  if (!currentPlan) return targetPlan.price;

  // Calculate used days since plan creation
  const now = new Date();
  const startDate = new Date(currentPlan.createdTime);
  
  // Reset time part to get accurate date difference
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const planStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  
  const usedDays = Math.floor((nowDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate total days in period
  const totalDays = Math.floor((new Date(currentPlan.expireTime).getTime() - new Date(currentPlan.createdTime).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate remaining days
  const remainingDays = Math.max(totalDays - usedDays, 0);

  // Calculate daily rate for current plan
  const currentDailyRate = currentPlan.price / totalDays;

  // Calculate refund for unused days
  const refundAmount = currentDailyRate * remainingDays;

  // Calculate final upgrade price
  const upgradeCost = targetPlan.price - refundAmount;
  
  return Math.max(0, Math.round(upgradeCost * 100) / 100);
};

export const isPlanUpgradable = (
  currentPlan: UserBenefits['membership'],
  targetPlan: MemberPlan
): boolean => {
  if (!currentPlan) return true;

  // Can't downgrade from yearly to monthly
  if (currentPlan.period_type === 2 && targetPlan.period_type === 1) {
    return false;
  }

  // If same period type, must be higher level
  if (targetPlan.period_type === currentPlan.period_type) {
    return targetPlan.level > currentPlan.level;
  }

  // Can upgrade from monthly to yearly
  return targetPlan.period_type > currentPlan.period_type;
};

export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};