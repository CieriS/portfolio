import profile from '@/data/cv-profile.json';

/**
 * Facts that only the CV states and the site does not render: which profiles to list, the
 * skills grouped the way a recruiter scans them, and spoken languages.
 * Certifications live in `shared.json`, where the site reads them too.
 * Language-independent; the labels live in `data/cv.json`.
 */
export type CvProfile = typeof profile;

export const cvProfile: CvProfile = profile;
