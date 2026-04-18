import { ArrowRight, CalendarDays, CheckCircle, CircleAlert, Clock3, Coins, House, ShieldCheck } from "lucide-react";
import { type ChatMessage } from "../hooks/use-conversation";

export type OfferMessageKind = "invitation" | "special_offer" | "decline" | "tenant_response";
export type OfferActionType = "pay" | "decline" | "change_dates";

export interface OfferMessagePayload {
  version: 1;
  kind: OfferMessageKind;
  listingTitle: string;
  tenantName?: string;
  landlordName?: string;
  monthlyRent?: number;
  deposit?: number;
  updatedRent?: number;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  expiresAt?: string | null;
  note?: string;
  responseAction?: "declined" | "change_dates_requested" | "payment_started";
}

const OFFER_MESSAGE_PREFIX = "__HA_OFFER_V1__";

function isOfferMessagePayload(value: unknown): value is OfferMessagePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<OfferMessagePayload>;
  return payload.version === 1 && (payload.kind === "invitation" || payload.kind === "special_offer" || payload.kind === "decline" || payload.kind === "tenant_response");
}

export function buildOfferMessage(payload: OfferMessagePayload) {
  return `${OFFER_MESSAGE_PREFIX}\n${JSON.stringify(payload)}`;
}

export function parseOfferMessage(body: string): OfferMessagePayload | null {
  if (!body.startsWith(OFFER_MESSAGE_PREFIX)) {
    return null;
  }

  const payloadText = body.slice(OFFER_MESSAGE_PREFIX.length).trimStart();
  if (!payloadText) {
    return null;
  }

  try {
    const parsed = JSON.parse(payloadText) as unknown;
    return isOfferMessagePayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getConversationPreview(body: string) {
  const offer = parseOfferMessage(body);
  if (!offer) {
    return body.replace(/\s+/g, " ").trim();
  }

  if (offer.kind === "invitation") {
    return `Invitation to book ${offer.listingTitle}`;
  }

  if (offer.kind === "special_offer") {
    return `Special offer for ${offer.listingTitle}`;
  }

  if (offer.kind === "tenant_response") {
    if (offer.responseAction === "declined") {
      return `Tenant declined invitation for ${offer.listingTitle}`;
    }
    if (offer.responseAction === "change_dates_requested") {
      return `Tenant requested date changes for ${offer.listingTitle}`;
    }
    if (offer.responseAction === "payment_started") {
      return `Tenant moved to payment for ${offer.listingTitle}`;
    }
    return `Tenant response for ${offer.listingTitle}`;
  }

  return `Application update for ${offer.listingTitle}`;
}

export function getConversationSearchableText(body: string) {
  const offer = parseOfferMessage(body);
  if (!offer) {
    return body;
  }

  return [
    offer.kind,
    offer.listingTitle,
    offer.tenantName,
    offer.landlordName,
    offer.note,
    offer.monthlyRent?.toString(),
    offer.deposit?.toString(),
    offer.updatedRent?.toString(),
    offer.moveInDate,
    offer.moveOutDate,
    offer.expiresAt,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatOfferDate(dateValue?: string | null) {
  if (!dateValue) {
    return "Not provided";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Not provided";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount?: number) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "Not provided";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onOfferAction?: (action: OfferActionType, offer: OfferMessagePayload) => void;
  actionInProgress?: OfferActionType | null;
}

export function ChatMessageBubble({ message, isMe, onOfferAction, actionInProgress = null }: ChatMessageBubbleProps) {
  const offer = parseOfferMessage(message.body);

  if (!offer) {
    return (
      <div
        className={`px-[14px] py-[10px] text-[14px] leading-[1.6] whitespace-pre-wrap break-words ${
          isMe ? "bg-brand-primary text-white rounded-[14px_14px_4px_14px]" : "bg-white text-[#1A1A1A] rounded-[14px_14px_14px_4px] border border-[rgba(0,0,0,0.06)]"
        }`}
      >
        {message.body}
      </div>
    );
  }

  if (offer.kind === "tenant_response") {
    const responseLabel =
      offer.responseAction === "declined"
        ? "Tenant declined invitation"
        : offer.responseAction === "change_dates_requested"
        ? "Tenant requested new dates"
        : offer.responseAction === "payment_started"
        ? "Tenant opened payment"
        : "Tenant response";

    return (
      <div className="w-full max-w-[420px] rounded-[16px] border border-accent-blue/25 bg-accent-blue/10 px-[14px] py-[12px]">
        <div className="inline-flex items-center gap-[6px] rounded-full bg-accent-blue px-[10px] py-[4px] text-[11px] font-semibold text-white">
          <CheckCircle className="w-[12px] h-[12px]" />
          Tenant update
        </div>
        <p className="mt-[8px] text-[14px] font-semibold text-neutral-black">{responseLabel}</p>
        {offer.note && <p className="mt-[4px] text-[13px] text-neutral-gray whitespace-pre-wrap">{offer.note}</p>}
      </div>
    );
  }

  const accentStyle =
    offer.kind === "invitation"
      ? "border-brand-primary/30 bg-brand-primary/10"
      : offer.kind === "special_offer"
      ? "border-accent-blue/25 bg-accent-blue/10"
      : "border-red-200 bg-red-50/80";

  const pillStyle =
    offer.kind === "invitation"
      ? "bg-brand-primary text-white"
      : offer.kind === "special_offer"
      ? "bg-accent-blue text-white"
      : "bg-red-600 text-white";

  const iconToneStyle =
    offer.kind === "invitation"
      ? "text-brand-primary"
      : offer.kind === "special_offer"
      ? "text-accent-blue"
      : "text-red-600";

  const heading =
    offer.kind === "invitation"
      ? `${offer.listingTitle} invitation from ReserveHousing`
      : offer.kind === "special_offer"
      ? `Updated offer for ${offer.listingTitle}`
      : `Application update for ${offer.listingTitle}`;

  const subheading =
    offer.kind === "invitation"
      ? "Review this ReserveHousing listing and confirm your booking to move forward."
      : offer.kind === "special_offer"
      ? "ReserveHousing has updated the terms. Review and respond in chat if you'd like to accept."
      : "The landlord has sent an update on your ReserveHousing application.";

  return (
    <div className={`w-full max-w-[420px] rounded-[18px] border px-[16px] py-[14px] shadow-[0_10px_24px_rgba(15,23,42,0.08)] ${accentStyle}`}>
      <div className="flex items-start justify-between gap-[12px] mb-[10px]">
        <div>
          <div className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] ${pillStyle}`}>
            {offer.kind === "invitation" ? <ShieldCheck className="w-[12px] h-[12px]" /> : offer.kind === "special_offer" ? <Coins className="w-[12px] h-[12px]" /> : <CircleAlert className="w-[12px] h-[12px]" />}
            {offer.kind === "invitation" ? "Invitation" : offer.kind === "special_offer" ? "Special offer" : "Application update"}
          </div>
          <h4 className="mt-[10px] text-[17px] leading-[1.3] font-bold text-neutral-black">{heading}</h4>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-neutral-gray">{subheading}</p>
        </div>
        <div className={`w-[34px] h-[34px] rounded-full bg-white border border-[rgba(0,0,0,0.08)] flex items-center justify-center ${iconToneStyle}`}>
          {offer.kind === "invitation" ? <House className="w-[16px] h-[16px]" /> : offer.kind === "special_offer" ? <CalendarDays className="w-[16px] h-[16px]" /> : <CircleAlert className="w-[16px] h-[16px]" />}
        </div>
      </div>

      <div className="grid gap-[8px] text-[13px] text-neutral-black">
        {offer.monthlyRent !== undefined && (
          <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-white/80 px-[12px] py-[9px] border border-[rgba(0,0,0,0.06)]">
            <span className="text-neutral-gray">Monthly rent</span>
            <span className="font-semibold text-neutral-black">{formatCurrency(offer.monthlyRent)}</span>
          </div>
        )}
        {offer.updatedRent !== undefined && (
          <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-white/80 px-[12px] py-[9px] border border-[rgba(0,0,0,0.06)]">
            <span className="text-neutral-gray">Updated rent</span>
            <span className="font-semibold text-neutral-black">{formatCurrency(offer.updatedRent)}</span>
          </div>
        )}
        {offer.deposit !== undefined && (
          <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-white/80 px-[12px] py-[9px] border border-[rgba(0,0,0,0.06)]">
            <span className="text-neutral-gray">Deposit</span>
            <span className="font-semibold text-neutral-black">{formatCurrency(offer.deposit)}</span>
          </div>
        )}
        {offer.moveInDate && (
          <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-white/80 px-[12px] py-[9px] border border-[rgba(0,0,0,0.06)]">
            <span className="text-neutral-gray">Move-in</span>
            <span className="font-semibold text-neutral-black">{formatOfferDate(offer.moveInDate)}</span>
          </div>
        )}
        {offer.moveOutDate && (
          <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-white/80 px-[12px] py-[9px] border border-[rgba(0,0,0,0.06)]">
            <span className="text-neutral-gray">Move-out</span>
            <span className="font-semibold text-neutral-black">{formatOfferDate(offer.moveOutDate)}</span>
          </div>
        )}
      </div>

      {offer.note && (
        <div className="mt-[12px] rounded-[12px] bg-white/80 border border-[rgba(0,0,0,0.06)] px-[12px] py-[10px]">
          <p className="text-[12px] text-neutral-gray uppercase tracking-[0.08em] mb-[4px]">Message</p>
          <p className="text-[13px] leading-[1.6] text-neutral-black whitespace-pre-wrap">{offer.note}</p>
        </div>
      )}

      {offer.kind === "invitation" && (
        <div className="mt-[12px] grid gap-[8px] sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onOfferAction?.("pay", offer)}
            disabled={!onOfferAction || actionInProgress !== null}
            className="inline-flex items-center justify-center gap-[6px] rounded-[10px] bg-brand-primary px-[12px] py-[10px] text-[12px] font-semibold text-white hover:bg-brand-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {actionInProgress === "pay" ? "Opening..." : "Pay to confirm"}
          </button>
          <button
            type="button"
            onClick={() => onOfferAction?.("decline", offer)}
            disabled={!onOfferAction || actionInProgress !== null}
            className="inline-flex items-center justify-center rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white px-[12px] py-[10px] text-[12px] font-semibold text-neutral-gray hover:bg-neutral-light-gray transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {actionInProgress === "decline" ? "Updating..." : "Decline"}
          </button>
          <button
            type="button"
            onClick={() => onOfferAction?.("change_dates", offer)}
            disabled={!onOfferAction || actionInProgress !== null}
            className="inline-flex items-center justify-center gap-[6px] rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white px-[12px] py-[10px] text-[12px] font-semibold text-neutral-gray hover:bg-neutral-light-gray transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {actionInProgress === "change_dates" ? "Sending..." : "Change dates"}
            <ArrowRight className="w-[14px] h-[14px]" />
          </button>
        </div>
      )}

      {offer.kind === "special_offer" && (
        <div className="mt-[12px] inline-flex items-center gap-[6px] rounded-full bg-white px-[10px] py-[5px] text-[11px] font-semibold text-accent-blue border border-accent-blue/30">
          <Clock3 className="w-[12px] h-[12px]" />
          Review in chat
        </div>
      )}

      {offer.kind === "decline" && (
        <div className="mt-[12px] inline-flex items-center gap-[6px] rounded-full bg-white px-[10px] py-[5px] text-[11px] font-semibold text-red-600 border border-red-200">
          <CircleAlert className="w-[12px] h-[12px]" />
          Application closed
        </div>
      )}
    </div>
  );
}