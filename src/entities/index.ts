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
}
