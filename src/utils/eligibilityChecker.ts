import { Scheme, User } from '../types';

export const checkEligibility = (user: User, scheme: Scheme): {
  eligible: boolean;
  reasons: string[];
} => {
  const eligibilityCriteria = scheme.eligibilityCriteria;
  let eligible = true;
  const reasons: string[] = [];

  // Check age criteria
  if (eligibilityCriteria.age) {
    if (eligibilityCriteria.age.min !== undefined && user.age < eligibilityCriteria.age.min) {
      eligible = false;
      reasons.push(`Minimum age required is ${eligibilityCriteria.age.min} years`);
    }
    if (eligibilityCriteria.age.max !== undefined && user.age > eligibilityCriteria.age.max) {
      eligible = false;
      reasons.push(`Maximum age limit is ${eligibilityCriteria.age.max} years`);
    }
  }

  // Check gender criteria
  if (eligibilityCriteria.gender && eligibilityCriteria.gender.length > 0) {
    if (!eligibilityCriteria.gender.includes(user.gender)) {
      eligible = false;
      reasons.push(`Scheme is only available for ${eligibilityCriteria.gender.join(', ')}`);
    }
  }

  // Check category criteria
  if (eligibilityCriteria.category && eligibilityCriteria.category.length > 0) {
    if (!eligibilityCriteria.category.includes(user.category)) {
      eligible = false;
      reasons.push(`Scheme is only available for ${eligibilityCriteria.category.join(', ')} categories`);
    }
  }

  // Check income criteria
  if (eligibilityCriteria.income && eligibilityCriteria.income.max !== undefined) {
    if (user.income > eligibilityCriteria.income.max) {
      eligible = false;
      reasons.push(`Maximum annual income limit is ₹${eligibilityCriteria.income.max.toLocaleString()}`);
    }
  }

  // Check education criteria
  if (eligibilityCriteria.education && eligibilityCriteria.education.length > 0) {
    if (!eligibilityCriteria.education.includes(user.education)) {
      eligible = false;
      reasons.push(`Required education qualification: ${eligibilityCriteria.education.join(' or ')}`);
    }
  }

  // Check location criteria
  if (eligibilityCriteria.location && eligibilityCriteria.location.length > 0) {
    if (!eligibilityCriteria.location.includes(user.location)) {
      eligible = false;
      reasons.push(`Scheme is only available for residents of ${eligibilityCriteria.location.join(', ')}`);
    }
  }

  // Check employment status criteria
  if (eligibilityCriteria.employmentStatus && eligibilityCriteria.employmentStatus.length > 0) {
    if (!eligibilityCriteria.employmentStatus.includes(user.employmentStatus)) {
      eligible = false;
      reasons.push(`Required employment status: ${eligibilityCriteria.employmentStatus.join(' or ')}`);
    }
  }

  return {
    eligible,
    reasons,
  };
};

export const getRecommendedSchemes = (user: User, schemes: Scheme[]): Scheme[] => {
  const eligibleSchemes = schemes.filter(scheme => {
    const result = checkEligibility(user, scheme);
    return result.eligible;
  });

  // Sort by most relevant (fewer criteria to meet)
  return eligibleSchemes.sort((a, b) => {
    const criteriaCountA = Object.keys(a.eligibilityCriteria).length;
    const criteriaCountB = Object.keys(b.eligibilityCriteria).length;
    return criteriaCountA - criteriaCountB;
  });
};

export const getEligibilityPercentage = (user: User, scheme: Scheme): number => {
  const criteria = scheme.eligibilityCriteria;
  const criteriaCount = Object.keys(criteria).length;
  let matchedCriteria = 0;

  // Age criteria
  if (criteria.age) {
    if (
      (criteria.age.min === undefined || user.age >= criteria.age.min) &&
      (criteria.age.max === undefined || user.age <= criteria.age.max)
    ) {
      matchedCriteria++;
    }
  }

  // Gender criteria
  if (criteria.gender) {
    if (!criteria.gender.length || criteria.gender.includes(user.gender)) {
      matchedCriteria++;
    }
  }

  // Category criteria
  if (criteria.category) {
    if (!criteria.category.length || criteria.category.includes(user.category)) {
      matchedCriteria++;
    }
  }

  // Income criteria
  if (criteria.income) {
    if (criteria.income.max === undefined || user.income <= criteria.income.max) {
      matchedCriteria++;
    }
  }

  // Education criteria
  if (criteria.education) {
    if (!criteria.education.length || criteria.education.includes(user.education)) {
      matchedCriteria++;
    }
  }

  // Location criteria
  if (criteria.location) {
    if (!criteria.location.length || criteria.location.includes(user.location)) {
      matchedCriteria++;
    }
  }

  // Employment status criteria
  if (criteria.employmentStatus) {
    if (!criteria.employmentStatus.length || criteria.employmentStatus.includes(user.employmentStatus)) {
      matchedCriteria++;
    }
  }

  return criteriaCount > 0 ? (matchedCriteria / criteriaCount) * 100 : 100;
};