import {t} from "@lingui/macro";
import {
  IconTools,
  IconSchool,
  IconDeviceLaptop,
  IconBriefcase,
  IconHeartHandshake,
  IconCompass,
  IconSparkles,
  IconTrophy,
  IconBuilding,
  IconUsers,
  IconPuzzle,
  IconTrees,
  IconCoffee,
  IconCategory,
  IconProps,
} from "@tabler/icons-react";
import React from "react";

export interface EventCategoryOption {
  id: string;
  name: string;
  Icon: React.ComponentType<IconProps>;
  emoji?: string;
}

export const getEventCategories = (): EventCategoryOption[] => [
  {id: 'WORKSHOP', name: t`Workshops & Training`, Icon: IconTools},
  {id: 'EDUCATION', name: t`Education & Academic`, Icon: IconSchool},
  {id: 'TECH', name: t`Tech & IT`, Icon: IconDeviceLaptop},
  {id: 'BUSINESS', name: t`Business & Entrepreneurship`, Icon: IconBriefcase},
  {id: 'CHARITY', name: t`Charity & Volunteer`, Icon: IconHeartHandshake},
  {id: 'TOURS', name: t`Tours & Visits`, Icon: IconCompass},
  {id: 'SPIRITUALITY', name: t`Islamic & Spiritual`, Icon: IconSparkles},
  {id: 'SPORTS', name: t`Sports & Athletics`, Icon: IconTrophy},
  {id: 'ART', name: t`Culture & Exhibitions`, Icon: IconBuilding},
  {id: 'FAMILY', name: t`Family Activities`, Icon: IconUsers},
  {id: 'HOBBIES', name: t`Skills & Hobbies`, Icon: IconPuzzle},
  {id: 'OUTDOORS', name: t`Outdoor Activities`, Icon: IconTrees},
  {id: 'FOOD_DRINK', name: t`Hospitality & Food`, Icon: IconCoffee},
  {id: 'OTHER', name: t`General & Other`, Icon: IconCategory},
];

export const getCategoryIcon = (categoryId?: string): React.ComponentType<IconProps> => {
  const categories = getEventCategories();
  const match = categories.find((c) => c.id === categoryId);
  return match ? match.Icon : IconCategory;
};
