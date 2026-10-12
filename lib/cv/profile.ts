import profile from '@/data/cv-profile.json';

/**
 * Facts that only the CV states and the site does not render: which profiles to list, the
 * skills grouped the way a recruiter scans them, spoken languages and certifications.
 * Language-independent; the labels live in `data/cv.json`.
 */
export type CvProfile = typeof profile;

export const cvProfile: CvProfile = profile;
