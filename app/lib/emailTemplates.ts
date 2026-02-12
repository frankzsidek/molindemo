import type { CustomerWithScores, EmailTemplate } from "./types";

/**
 * Generate check-in email template for at-risk customers
 */
export function generateCheckInTemplate(
  customer: CustomerWithScores,
  csmName: string = "[CSM Name]"
): EmailTemplate {
  const subject = `Just checking in on your Molin experience 👋`;

  const body = `Hi there,

I noticed we haven't chatted in a while and wanted to see how things are going with Molin for ${customer.companyName}.

I saw that you haven't logged in for about ${customer.daysSinceLogin} days${
    customer.usagePercentage < 50
      ? ` and your conversation usage has dropped to ${Math.round(customer.usagePercentage)}%`
      : ""
  }.

Are you still getting value from the platform? Is there anything we can help with or improve? We're here to make sure Molin works well for your team.

Would love to catch up this week if you have 15 minutes.

Best regards,
${csmName}`;

  return {
    type: "check-in",
    subject,
    body,
  };
}

/**
 * Generate upgrade email template for expansion opportunities
 */
export function generateUpgradeTemplate(
  customer: CustomerWithScores,
  csmName: string = "[CSM Name]"
): EmailTemplate {
  const nextTier = getNextTier(customer.currentTier);
  const revenueUpside =
    customer.potentialMRRIfUpgraded - customer.monthlyRecurringRevenue;

  const subject = `Quick idea: Scale ${customer.companyName}'s chatbot to the next level 🚀`;

  const benefits = getUpgradeBenefits(customer.currentTier, nextTier);

  const body = `Hi there,

Great news! I noticed you're using ${Math.round(customer.usagePercentage)}% of your monthly conversation limit on the ${customer.currentTier} plan.

Your current tier (${customer.currentTier}) handles ${customer.monthlyConversationLimit.toLocaleString()} conversations/month, but with your growth, you might benefit from ${nextTier} (${getConversationLimit(nextTier).toLocaleString()} conversations/month).

Upgrading would give you:
${benefits}

This would cost an additional $${revenueUpside}/month but would ensure you never hit your conversation limits.

Interested in a 15-min call to see if it makes sense for ${customer.companyName}?

Best regards,
${csmName}

Co-Authored-By: Claude <noreply@anthropic.com>`;

  return {
    type: "upgrade",
    subject,
    body,
  };
}

/**
 * Generate feature demo email template
 */
export function generateFeatureDemoTemplate(
  customer: CustomerWithScores,
  csmName: string = "[CSM Name]"
): EmailTemplate {
  const topUnusedFeature = customer.featuresNotUsed[0] || "Lead Gen AI";

  const subject = `New feature to explore: ${topUnusedFeature} for ${customer.companyName} 💼`;

  const featureDescription = getFeatureDescription(topUnusedFeature);
  const featureBenefit = getFeatureBenefit(topUnusedFeature);

  const body = `Hi there,

You're doing amazing with ${customer.featuresUsed.join(", ")}${customer.featuresUsed.length > 1 ? " features" : ""}! I wanted to introduce you to another powerful capability: ${topUnusedFeature}.

${featureDescription}

${featureBenefit}

${
  customer.featuresNotUsed.length > 1
    ? `You also have access to ${customer.featuresNotUsed.slice(1).join(", ")} which could further enhance your setup.`
    : ""
}

Would you like a quick 10-minute walkthrough? I can show you how ${customer.companyName} could benefit.

Best regards,
${csmName}`;

  return {
    type: "feature-demo",
    subject,
    body,
  };
}

/**
 * Helper: Get next tier for upgrade
 */
function getNextTier(currentTier: string): string {
  const tierOrder = ["Free", "Startup", "Growth", "Scale", "Enterprise"];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return "Enterprise";
  }
  return tierOrder[currentIndex + 1];
}

/**
 * Helper: Get conversation limit by tier
 */
function getConversationLimit(tier: string): number {
  const limits: Record<string, number> = {
    Free: 50,
    Startup: 125,
    Growth: 500,
    Scale: 1250,
    Enterprise: 999999,
  };
  return limits[tier] || 125;
}

/**
 * Helper: Get upgrade benefits
 */
function getUpgradeBenefits(currentTier: string, nextTier: string): string {
  if (nextTier === "Enterprise") {
    return `- Unlimited monthly conversations
- Priority support with dedicated success manager
- Custom integrations tailored to your needs
- Advanced analytics and reporting
- White-label options`;
  }

  if (nextTier === "Scale") {
    return `- ${getConversationLimit(nextTier).toLocaleString()} monthly conversations (up from ${getConversationLimit(currentTier).toLocaleString()})
- Access to advanced personalization features
- Priority support response times
- Advanced analytics dashboard`;
  }

  if (nextTier === "Growth") {
    return `- ${getConversationLimit(nextTier).toLocaleString()} monthly conversations (up from ${getConversationLimit(currentTier).toLocaleString()})
- Multi-language support
- Enhanced AI capabilities
- Email support`;
  }

  return `- Higher conversation limits
- More advanced features
- Better support options`;
}

/**
 * Helper: Get feature description
 */
function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    "Support AI":
      "Support AI automatically answers common customer questions 24/7, reducing your support team's workload by up to 70%.",
    "Sales AI":
      "Sales AI engages potential customers in real-time, qualifying leads and guiding them through your sales funnel.",
    "Lead Gen":
      "Lead Gen AI automatically collects emails & phone numbers from interested website visitors, building your contact list while you sleep.",
    Personalization:
      "Personalization AI adapts responses based on user behavior, location, and preferences to create tailored experiences for each visitor.",
    Ninja:
      "Ninja mode provides advanced customization options, letting you fine-tune AI behavior with custom prompts and logic flows.",
  };
  return descriptions[feature] || `${feature} is a powerful feature that can enhance your customer engagement.`;
}

/**
 * Helper: Get feature benefit
 */
function getFeatureBenefit(feature: string): string {
  const benefits: Record<string, string> = {
    "Support AI":
      "This could save your team several hours per week on repetitive questions.",
    "Sales AI":
      "Companies using Sales AI typically see a 35% increase in qualified leads.",
    "Lead Gen":
      "On average, Lead Gen captures 15-20 new contacts per week automatically.",
    Personalization:
      "Personalized experiences increase conversion rates by up to 25%.",
    Ninja:
      "Advanced users leverage Ninja to create highly specific workflows unique to their business.",
  };
  return benefits[feature] || `This feature could significantly improve your results.`;
}

/**
 * Get all three templates for a customer
 */
export function getAllTemplatesForCustomer(
  customer: CustomerWithScores,
  csmName?: string
): {
  checkIn: EmailTemplate;
  upgrade: EmailTemplate;
  featureDemo: EmailTemplate;
} {
  return {
    checkIn: generateCheckInTemplate(customer, csmName),
    upgrade: generateUpgradeTemplate(customer, csmName),
    featureDemo: generateFeatureDemoTemplate(customer, csmName),
  };
}
