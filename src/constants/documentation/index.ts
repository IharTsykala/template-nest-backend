//enum
import { ResponseActionsEnum } from 'src/enum';

export const DESCRIPTIONS_RESPONSE = {
  [ResponseActionsEnum.Month]:
    'It returns object checkout session from stripe include url for redirect to stripe monthly session page',
  [ResponseActionsEnum.Year]:
    'It returns object checkout session from stripe include url for redirect to stripe yearly session page',
  [ResponseActionsEnum.Billing]:
    'It returns object checkout session from stripe include url for redirect to stripe monthly session page',
  USER_SUBSCRIPTIONS: 'It returns array with one user subscription',
  USER_ACCESS: 'It returns object with accesses',
};

export const URLS_RESPONSE = {
  [ResponseActionsEnum.Month]:
    'https://checkout.stripe.com/c/pay/cs_test_a18phctT90zMvL9...XdwYHgl',
  [ResponseActionsEnum.Year]:
    'https://checkout.stripe.com/c/pay/cs_test_a18phctT90zMvL9...XdwYHgl',
  [ResponseActionsEnum.Billing]:
    'https://billing.stripe.com/p/session/test_YWNjdF8xTm12VlFK...MWdh0100rmT5Tqb6',
};

export const COMMON_PROPERTIES_RESPONSE = {
  SUBSCRIPTION_ID: 'sub_1O6z40JBnfHK5vEq1r8KgUw5',
  CURRENT_PERIOD_END: '2023-11-30T16:55:33.000Z',
  OBJECT_ID: '653fdfdb46ee8f13401491c7',
};
