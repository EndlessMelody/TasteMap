"""
Membership Router — /api/v1/membership/*
See docs/api/monetization.md for the full endpoint spec.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user_id
from src.db.database import get_db
from src.membership import service
from src.membership.schemas import SubscribeRequest, SavePaymentMethodRequest, EquipFrameRequest

router = APIRouter()


@router.get("/plans", summary="Danh sách các gói trả phí")
async def get_plans():
    return {"success": True, "data": service.list_plans()}


@router.get("/entitlements", summary="Ma trận quyền lợi theo tier")
async def get_entitlements_matrix():
    return {"success": True, "data": service.list_entitlements()}


@router.get("/me", summary="Trạng thái hội viên hiện tại")
async def get_my_membership(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.get_membership_status(db, user_id)}


@router.get("/quotas", summary="Quota usage hiện tại theo feature")
async def get_my_quotas(
    request: Request,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.get_quotas(db, request, user_id)}


@router.post("/subscribe", summary="Đăng ký gói Feast qua mock Visa")
async def subscribe(
    body: SubscribeRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.subscribe(db, user_id, body)}


@router.post("/cancel", summary="Hủy tự động gia hạn")
async def cancel(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.cancel_subscription(db, user_id)}


@router.post("/resume", summary="Bật lại tự động gia hạn")
async def resume(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.resume_subscription(db, user_id)}


@router.get("/payment-methods", summary="Danh sách thẻ đã lưu")
async def get_payment_methods(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.list_payment_methods(db, user_id)}


@router.post("/payment-methods", summary="Lưu thẻ mới (không thanh toán)")
async def add_payment_method(
    body: SavePaymentMethodRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.add_payment_method(db, user_id, body)}


@router.delete("/payment-methods/{payment_method_id}", summary="Xóa thẻ đã lưu")
async def delete_payment_method(
    payment_method_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await service.delete_payment_method(db, user_id, payment_method_id)
    return {"success": True, "data": None}


@router.get("/transactions", summary="Lịch sử giao dịch")
async def get_transactions(
    limit: int = 10,
    offset: int = 0,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.list_transactions(db, user_id, limit, offset)}


@router.get("/transactions/{transaction_id}/receipt", summary="Biên lai chi tiết")
async def get_receipt(
    transaction_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.get_receipt(db, user_id, transaction_id)}


@router.get("/frames", summary="Catalog khung avatar")
async def get_frames(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.list_frames(db, user_id)}


@router.put("/frames/equip", summary="Gắn/gỡ một khung avatar")
async def equip_frame(
    body: EquipFrameRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.equip_frame(db, user_id, body.frame_id)}
