import { HttpRequest } from "@/utils/http/request";
import { ApiResponse } from "@/utils/http/types";

const httpClient = HttpRequest.getInstance();

const path = {
  // 取消支付订单
  CANCEL_PAYMENT_ORDER: "/payment/cancel",
  // 创建支付订单
  CREATE_PAYMENT_ORDER: "/payment/create",
  // 获取支付订单详情
  GET_PAYMENT_ORDER_DETAIL: "/payment/detail",
  // 获取充值档位列表
  GET_RECHARGE_LIST: "/payment/recharge-tiers",
  // 搜索支付记录
  SEARCH_PAYMENT_RECORD: "/payment/search",
  // vip套餐列表(带价格)
  GET_VIP_LIST: "/api/vip/plans/pricing",
  // vip套餐列表(不带价格)
  GET_VIP_LIST_NO_PRICE: "/api/vip/plans",
  // vip订阅
  SUBSCRIBE_VIP: "/payment/stripe/subscription/create",
} as const;

// 基础响应类型
interface BaseResponse {
  code: number;
  message: string;
}

// 通用无信息返回
interface EmptyResponse extends BaseResponse {}

// 创建支付订单响应类型
export interface CreatePaymentOrderResponse {
  order_id: number;
  out_trade_no: string;
  pay_url: string;
  customer: string;
  ephemeralKey: string;
  sk: string;
}

// vip订阅返回类型
export interface SubscribeResponse {
  amount: number;
  expire_time: number;
  pay_url: string;
  payment_id: number;
  trade_no: string;
  customer: string;
  ephemeralKey: string;
  sk: string;
}

// 获取支付订单详情响应类型
interface GetPaymentOrderDetailResponse {
  id: number;
  user_id: number;
  order_id: number;
  out_trade_no: string;
  product_id: number;
  product_type: number;
  payment_gateway: string;
  payment_method: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// 获取充值档位列表响应类型
interface GetRechargeListResponse
  extends Array<{
    description: string;
    amount: number;
    coins_amount: number;
    bonus: number;
    is_popular: boolean;
    id: number;
  }> {}

// 搜索支付记录响应类型
interface SearchPaymentRecordResponse {
  total: number;
  list: Array<{
    id: number;
    user_id: number;
    order_id: number;
    out_trade_no: string;
    product_id: number;
    product_type: number;
    payment_gateway: string;
    payment_method: string;
    amount: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}

// vip套餐列表响应类型
export interface GetVipListResponse {
  created_at: string;
  duration: number;
  features: string;
  first_time_buy_price: number;
  id: number;
  is_active: boolean;
  is_first_time_buy_enabled: boolean;
  name: string;
  original_price: number;
  price: number;
  sort_order: number;
  subscription_type: string;
  updated_at: string;
  vip_level: number;
}

// vip套餐列表(不带价格)响应类型
interface GetVipListNoPriceResponse {
  id: number;
  name: string;
  description: string;
}

export const paymentService = {
  // 取消支付订单
  async cancelPaymentOrder(params: {
    id: number;
    user_id: number;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(path.CANCEL_PAYMENT_ORDER, params);
  },

  // 创建支付订单
  async createPaymentOrder(params: {
    desc: string;
    payment_gateway:
      | "ALIPAY"
      | "WECHAT"
      | "PAYPAL"
      | "BALANCE"
      | "GOOGLE"
      | "IOS"
      | "PIX"
      | "STRIPE";
    payment_method: "WEB" | "APP" | "QRCODE";
    product_id: number;
    product_type: 1 | 2 | 3; // 1: 充值 2: 购买 3: 订阅
  }): Promise<ApiResponse<CreatePaymentOrderResponse>> {
    return httpClient.post<CreatePaymentOrderResponse>(
      path.CREATE_PAYMENT_ORDER,
      params
    );
  },

  // 获取支付订单详情
  async getPaymentOrderDetail(params: {
    order_id: number;
    id: number;
    out_trade_no: string;
  }): Promise<ApiResponse<GetPaymentOrderDetailResponse>> {
    return httpClient.get<GetPaymentOrderDetailResponse>(
      path.GET_PAYMENT_ORDER_DETAIL,
      params
    );
  },

  // 获取充值档位列表
  async getRechargeList(): Promise<ApiResponse<GetRechargeListResponse>> {
    return httpClient.get<GetRechargeListResponse>(path.GET_RECHARGE_LIST);
  },

  // 搜索支付记录
  async searchPaymentRecord(params: {
    page: number;
    page_size: number;
    user_id: number;
    order_id: number;
    status: string;
    start_time: string;
    end_time: string;
  }): Promise<ApiResponse<SearchPaymentRecordResponse>> {
    return httpClient.get<SearchPaymentRecordResponse>(
      path.SEARCH_PAYMENT_RECORD,
      params
    );
  },

  // vip套餐列表
  async getVipList(): Promise<ApiResponse<GetVipListResponse>> {
    return httpClient.get<GetVipListResponse>(path.GET_VIP_LIST);
  },

  // vip套餐列表(不带价格)
  async getVipListNoPrice(): Promise<ApiResponse<GetVipListResponse[]>> {
    return httpClient.get<GetVipListResponse[]>(path.GET_VIP_LIST_NO_PRICE);
  },

  // vip订阅
  async subscribeVip(params: {
    auto_renew: boolean;
    payment_gateway:
      | "ALIPAY"
      | "WECHAT"
      | "PAYPAL"
      | "BALANCE"
      | "GOOGLE"
      | "IOS"
      | "PIX"
      | "STRIPE";
    payment_method: "WEB" | "APP" | "QRCODE";
    subscription_type: string;
    vip_level: number;
    payment_method_id: "Card" | "Klarna" | "Afterpay" | "Affirm";
  }): Promise<ApiResponse<SubscribeResponse>> {
    return httpClient.post<SubscribeResponse>(path.SUBSCRIBE_VIP, params);
  },
};
