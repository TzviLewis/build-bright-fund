import { CampaignDetails, Donations, Teams, Matchers } from '@/entities';

/**
 * AI Service for campaign analytics, recommendations, and insights
 * Provides intelligent data analysis without external API calls
 */

export interface CampaignInsight {
  campaignId: string;
  healthScore: number; // 0-100
  performanceStatus: 'excellent' | 'good' | 'fair' | 'needs-attention';
  insights: string[];
  recommendations: string[];
  predictedCompletionDate?: Date;
  estimatedFinalAmount?: number;
}

export interface DonorBehavior {
  averageDonationAmount: number;
  donationFrequency: 'high' | 'medium' | 'low';
  preferredCampaignTypes: string[];
  engagementScore: number; // 0-100
}

export interface CampaignRecommendation {
  campaignId: string;
  campaignTitle?: string;
  relevanceScore: number; // 0-100
  reason: string;
  matchPercentage: number;
}

export interface SearchResult {
  campaignId: string;
  campaignTitle?: string;
  relevanceScore: number;
  matchedFields: string[];
}

export interface CampaignAlert {
  campaignId: string;
  type: 'milestone' | 'urgency' | 'opportunity' | 'performance';
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

class AIService {
  /**
   * Analyze campaign performance and generate insights
   */
  analyzeCampaignPerformance(
    campaign: CampaignDetails,
    donations: Donations[],
    teams: Teams[]
  ): CampaignInsight {
    const campaignDonations = donations.filter(d => d.status === 'completed');
    const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const goal = campaign.fundraisingGoal || 1;
    const progress = Math.min((totalRaised / goal) * 100, 100);
    
    const now = new Date();
    const startDate = campaign.campaignStartDate ? new Date(campaign.campaignStartDate) : null;
    const endDate = campaign.campaignEndDate ? new Date(campaign.campaignEndDate) : null;
    
    let daysElapsed = 0;
    let daysRemaining = 0;
    let totalDays = 0;
    
    if (startDate && endDate) {
      daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Calculate health score (0-100)
    const progressScore = progress;
    const velocityScore = daysElapsed > 0 ? Math.min((progress / (daysElapsed / totalDays)) * 100, 100) : 0;
    const donorEngagementScore = campaignDonations.length > 0 ? Math.min(campaignDonations.length * 5, 100) : 0;
    
    const healthScore = Math.round((progressScore * 0.5 + velocityScore * 0.3 + donorEngagementScore * 0.2) / 3);

    // Determine performance status
    let performanceStatus: 'excellent' | 'good' | 'fair' | 'needs-attention';
    if (healthScore >= 80) performanceStatus = 'excellent';
    else if (healthScore >= 60) performanceStatus = 'good';
    else if (healthScore >= 40) performanceStatus = 'fair';
    else performanceStatus = 'needs-attention';

    // Generate insights
    const insights: string[] = [];
    
    if (progress >= 100) {
      insights.push('🎉 Campaign goal achieved! Excellent work!');
    } else if (progress >= 75) {
      insights.push('📈 Campaign is performing very well, close to goal');
    } else if (progress >= 50) {
      insights.push('💪 Campaign is on track, halfway to goal');
    } else if (progress >= 25) {
      insights.push('⚠️ Campaign needs more momentum to reach goal');
    } else {
      insights.push('🚀 Campaign is in early stages, focus on promotion');
    }

    if (campaignDonations.length > 0) {
      const avgDonation = totalRaised / campaignDonations.length;
      insights.push(`💰 Average donation: £${avgDonation.toFixed(2)}`);
    }

    if (daysRemaining > 0 && progress < 100) {
      const dailyRate = daysElapsed > 0 ? totalRaised / daysElapsed : 0;
      const projectedTotal = dailyRate * (daysElapsed + daysRemaining);
      insights.push(`📊 Projected final amount: £${Math.round(projectedTotal).toLocaleString()}`);
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (progress < 50 && daysRemaining > 7) {
      recommendations.push('Increase promotional efforts to boost visibility');
    }
    if (campaignDonations.length < 10 && daysRemaining > 3) {
      recommendations.push('Reach out to potential donors directly');
    }
    if (progress >= 75 && progress < 100) {
      recommendations.push('Create urgency messaging - campaign is almost complete!');
    }
    if (totalRaised > goal * 0.5 && campaign.bonusGoal) {
      recommendations.push('Highlight bonus goal to encourage additional donations');
    }

    // Predict completion date
    let predictedCompletionDate: Date | undefined;
    let estimatedFinalAmount: number | undefined;

    if (daysElapsed > 0 && progress < 100) {
      const dailyRate = totalRaised / daysElapsed;
      const daysToComplete = (goal - totalRaised) / (dailyRate || 1);
      if (daysToComplete > 0) {
        predictedCompletionDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
      }
      estimatedFinalAmount = dailyRate * (daysElapsed + daysRemaining);
    }

    return {
      campaignId: campaign._id,
      healthScore,
      performanceStatus,
      insights,
      recommendations,
      predictedCompletionDate,
      estimatedFinalAmount,
    };
  }

  /**
   * Generate personalized campaign recommendations based on donation history
   */
  generateRecommendations(
    campaigns: CampaignDetails[],
    donations: Donations[],
    userDonationHistory?: Donations[]
  ): CampaignRecommendation[] {
    const recommendations: CampaignRecommendation[] = [];

    campaigns.forEach(campaign => {
      let relevanceScore = 50; // Base score
      const matchedReasons: string[] = [];

      // Factor 1: Campaign momentum (30 points)
      const campaignDonations = donations.filter(d => d.status === 'completed');
      if (campaignDonations.length > 5) {
        relevanceScore += 15;
        matchedReasons.push('Popular campaign with strong donor support');
      }

      // Factor 2: Progress towards goal (30 points)
      const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const progress = campaign.fundraisingGoal ? (totalRaised / campaign.fundraisingGoal) * 100 : 0;
      
      if (progress >= 75 && progress < 100) {
        relevanceScore += 20;
        matchedReasons.push('Nearly complete - help finish this campaign!');
      } else if (progress < 25) {
        relevanceScore += 10;
        matchedReasons.push('Early stage campaign with high impact potential');
      }

      // Factor 3: Campaign recency (20 points)
      if (campaign.campaignStartDate) {
        const startDate = new Date(campaign.campaignStartDate);
        const daysSinceStart = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceStart < 7) {
          relevanceScore += 15;
          matchedReasons.push('New campaign - be among the first supporters');
        }
      }

      // Factor 4: User history alignment (20 points)
      if (userDonationHistory && userDonationHistory.length > 0) {
        const userAvgDonation = userDonationHistory.reduce((sum, d) => sum + (d.amount || 0), 0) / userDonationHistory.length;
        const campaignAvgDonation = campaignDonations.length > 0 
          ? totalRaised / campaignDonations.length 
          : 0;
        
        if (Math.abs(userAvgDonation - campaignAvgDonation) < userAvgDonation * 0.5) {
          relevanceScore += 10;
          matchedReasons.push('Matches your typical donation pattern');
        }
      }

      recommendations.push({
        campaignId: campaign._id,
        campaignTitle: campaign.campaignTitle,
        relevanceScore: Math.min(relevanceScore, 100),
        reason: matchedReasons.join(' • '),
        matchPercentage: Math.min(relevanceScore, 100),
      });
    });

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Intelligent search across campaigns
   */
  searchCampaigns(
    campaigns: CampaignDetails[],
    query: string
  ): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    campaigns.forEach(campaign => {
      let relevanceScore = 0;
      const matchedFields: string[] = [];

      // Title match (highest priority)
      if (campaign.campaignTitle?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 100;
        matchedFields.push('title');
      }

      // Description match
      if (campaign.projectDescription?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 50;
        matchedFields.push('description');
      }

      // Promotional text match
      if (campaign.promotionalText?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 30;
        matchedFields.push('promotional');
      }

      // Bonus goal description match
      if (campaign.bonusGoalDescription?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 20;
        matchedFields.push('bonus');
      }

      if (relevanceScore > 0) {
        results.push({
          campaignId: campaign._id,
          campaignTitle: campaign.campaignTitle,
          relevanceScore,
          matchedFields,
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Generate smart alerts for campaigns
   */
  generateAlerts(
    campaigns: CampaignDetails[],
    donations: Donations[]
  ): CampaignAlert[] {
    const alerts: CampaignAlert[] = [];
    const now = new Date();

    campaigns.forEach(campaign => {
      const campaignDonations = donations.filter(d => d.status === 'completed');
      const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const goal = campaign.fundraisingGoal || 1;
      const progress = (totalRaised / goal) * 100;

      // Milestone alerts
      if (progress >= 100) {
        alerts.push({
          campaignId: campaign._id,
          type: 'milestone',
          message: `🎉 ${campaign.campaignTitle} has reached its goal!`,
          priority: 'high',
          actionable: true,
        });
      } else if (progress >= 90) {
        alerts.push({
          campaignId: campaign._id,
          type: 'milestone',
          message: `🚀 ${campaign.campaignTitle} is 90% funded - almost there!`,
          priority: 'high',
          actionable: true,
        });
      } else if (progress >= 75) {
        alerts.push({
          campaignId: campaign._id,
          type: 'milestone',
          message: `💪 ${campaign.campaignTitle} is 75% funded!`,
          priority: 'medium',
          actionable: true,
        });
      }

      // Urgency alerts
      if (campaign.campaignEndDate) {
        const endDate = new Date(campaign.campaignEndDate);
        const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining === 1 && progress < 100) {
          alerts.push({
            campaignId: campaign._id,
            type: 'urgency',
            message: `⏰ ${campaign.campaignTitle} ends tomorrow!`,
            priority: 'high',
            actionable: true,
          });
        } else if (daysRemaining <= 3 && progress < 100) {
          alerts.push({
            campaignId: campaign._id,
            type: 'urgency',
            message: `⏳ ${campaign.campaignTitle} ends in ${daysRemaining} days`,
            priority: 'high',
            actionable: true,
          });
        }
      }

      // Opportunity alerts
      if (campaign.bonusGoal && totalRaised > goal && totalRaised < campaign.bonusGoal) {
        const bonusProgress = ((totalRaised - goal) / (campaign.bonusGoal - goal)) * 100;
        if (bonusProgress > 50) {
          alerts.push({
            campaignId: campaign._id,
            type: 'opportunity',
            message: `🎁 ${campaign.campaignTitle} bonus goal is within reach!`,
            priority: 'medium',
            actionable: true,
          });
        }
      }

      // Performance alerts
      if (campaign.campaignStartDate) {
        const startDate = new Date(campaign.campaignStartDate);
        const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const expectedProgress = (daysElapsed / 30) * 100; // Assuming 30-day campaign

        if (daysElapsed > 7 && progress < expectedProgress * 0.5) {
          alerts.push({
            campaignId: campaign._id,
            type: 'performance',
            message: `📉 ${campaign.campaignTitle} is underperforming - needs attention`,
            priority: 'medium',
            actionable: true,
          });
        }
      }
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate AI-enhanced campaign descriptions
   */
  generateEnhancedDescription(campaign: CampaignDetails): string {
    const parts: string[] = [];

    if (campaign.projectDescription) {
      parts.push(campaign.projectDescription);
    }

    if (campaign.promotionalText) {
      parts.push(`\n\n✨ ${campaign.promotionalText}`);
    }

    if (campaign.bonusGoalDescription && campaign.bonusGoal) {
      parts.push(`\n\n🎁 Bonus Goal: ${campaign.bonusGoalDescription}`);
    }

    return parts.join('');
  }

  /**
   * Analyze donor behavior patterns
   */
  analyzeDonorBehavior(donations: Donations[]): DonorBehavior {
    if (donations.length === 0) {
      return {
        averageDonationAmount: 0,
        donationFrequency: 'low',
        preferredCampaignTypes: [],
        engagementScore: 0,
      };
    }

    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const averageDonationAmount = totalAmount / donations.length;

    let donationFrequency: 'high' | 'medium' | 'low' = 'low';
    if (donations.length > 20) donationFrequency = 'high';
    else if (donations.length > 5) donationFrequency = 'medium';

    const engagementScore = Math.min(donations.length * 5, 100);

    return {
      averageDonationAmount,
      donationFrequency,
      preferredCampaignTypes: [],
      engagementScore,
    };
  }

  /**
   * Get trending campaigns based on recent activity
   */
  getTrendingCampaigns(
    campaigns: CampaignDetails[],
    donations: Donations[],
    limit: number = 5
  ): CampaignDetails[] {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const campaignsWithTrending = campaigns.map(campaign => {
      const recentDonations = donations.filter(
        d => d.status === 'completed' && 
        new Date(d.donationDate || 0) >= oneWeekAgo
      );
      const recentAmount = recentDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      return {
        campaign,
        trendingScore: recentAmount + recentDonations.length * 10,
      };
    });

    return campaignsWithTrending
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit)
      .map(item => item.campaign);
  }
}

export const aiService = new AIService();
