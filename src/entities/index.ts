/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: campaigndetails
 * Interface for CampaignDetails
 */
export interface CampaignDetails {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  campaignTitle?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType url */
  homepageVideo?: string;
  /** @wixFieldType url */
  uploadedVideo?: string;
  /** @wixFieldType url */
  campaignVideo?: string;
  /** @wixFieldType text */
  bonusGoalDescription?: string;
  /** @wixFieldType number */
  bonusGoal?: number;
  /** @wixFieldType number */
  fundraisingGoal?: number;
  /** @wixFieldType text */
  projectDescription?: string;
  /** @wixFieldType text */
  promotionalText?: string;
  /** @wixFieldType image */
  mainCampaignImage?: string;
  /** @wixFieldType date */
  campaignStartDate?: Date | string;
  /** @wixFieldType date */
  campaignEndDate?: Date | string;
  /** @wixFieldType time */
  campaignStartTime?: any;
  /** @wixFieldType time */
  campaignEndTime?: any;
  /** @wixFieldType video */
  video?: string;
}


/**
 * Collection ID: donations
 * Interface for Donations
 */
export interface Donations {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  teamId?: string;
  /** @wixFieldType text */
  replies?: string;
  /** @wixFieldType text */
  donorName?: string;
  /** @wixFieldType text */
  donorEmail?: string;
  /** @wixFieldType number */
  amount?: number;
  /** @wixFieldType datetime */
  donationDate?: Date | string;
  /** @wixFieldType boolean */
  isAnonymous?: boolean;
  /** @wixFieldType text */
  donorMessage?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType number */
  originalAmount?: number;
  /** @wixFieldType text */
  teamIds?: string;
  /** @wixFieldType text */
  pageName?: string;
}


/**
 * Collection ID: galleryimages
 * Interface for GalleryImages
 */
export interface GalleryImages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType image */
  image?: string;
  /** @wixFieldType text */
  altText?: string;
  /** @wixFieldType number */
  width?: number;
  /** @wixFieldType number */
  height?: number;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType number */
  displayOrder?: number;
}


/**
 * Collection ID: matchers
 * Interface for Matchers
 */
export interface Matchers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  matcherName?: string;
  /** @wixFieldType number */
  matchingAmount?: number;
  /** @wixFieldType number */
  matchingPercentage?: number;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  contactEmail?: string;
  /** @wixFieldType number */
  matchingLimit?: number;
}


/**
 * Collection ID: teams
 * Interface for Teams
 */
export interface Teams {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  teamName?: string;
  /** @wixFieldType text */
  teamPassword?: string;
  /** @wixFieldType number */
  fundraisingGoal?: number;
  /** @wixFieldType text */
  teamDescription?: string;
  /** @wixFieldType number */
  memberCount?: number;
  /** @wixFieldType image */
  teamLogo?: string;
  /** @wixFieldType number */
  teamId?: number;
}
