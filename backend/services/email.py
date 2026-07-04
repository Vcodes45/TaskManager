import os
import resend
from database.connection import SessionLocal
from models.productivity import Notification


def _send_email(to: str, subject: str, html: str):
    """Low-level email sender via Resend."""
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        print("Warning: RESEND_API_KEY not set. Skipping email.")
        return

    resend.api_key = api_key

    try:
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to,
            "subject": subject,
            "html": html
        })
        print(f"Resend email sent to {to}: {response}")
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")


def _create_notification(user_id: int, title: str, message: str, notif_type: str):
    """Create an in-app notification record using its own DB session."""
    db = SessionLocal()
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            is_read=0
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        print(f"Failed to create notification: {e}")
        db.rollback()
    finally:
        db.close()


def notify_task_created(user_email: str, user_name: str, user_id: int, task_title: str, task_priority: str, task_due_date, task_description: str):
    """Send email + in-app notification when a new task is created."""
    title = "New Task Created"
    message = f"Your task \"{task_title}\" has been created. Priority: {task_priority or 'Medium'}."

    # In-app notification
    _create_notification(user_id, title, message, "TASK_CREATED")

    # Email
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #e0e0e0; background: #1a1a2e; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #a78bfa;">Kal Se — Task Manager</h1>
        </div>
        <h2 style="color: #fff; margin-bottom: 8px;">Thank you for working with us! 🚀</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>Your new task has been successfully added:</p>
        <div style="background: #16213e; padding: 20px; border-radius: 12px; border-left: 4px solid #a78bfa; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; color: #a78bfa; font-size: 18px;">{task_title}</h3>
            <p style="margin: 4px 0;"><strong>Priority:</strong> {task_priority or 'Medium'}</p>
            {f'<p style="margin: 4px 0;"><strong>Due:</strong> {task_due_date}</p>' if task_due_date else ''}
            {f'<p style="margin: 4px 0; color: #aaa;">{task_description}</p>' if task_description else ''}
        </div>
        <p>Keep crushing your goals! 💪</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px; text-align: center;">— The Kal Se Team</p>
    </div>
    """
    _send_email(user_email, f"✅ New Task: {task_title}", html)


def notify_task_completed(user_email: str, user_name: str, user_id: int, task_title: str):
    """Send email + in-app notification when a task is completed."""
    title = "Task Completed! 🎉"
    message = f"Great job! You completed \"{task_title}\". +10 XP earned."

    _create_notification(user_id, title, message, "TASK_COMPLETED")

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #e0e0e0; background: #1a1a2e; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #a78bfa;">Kal Se — Task Manager</h1>
        </div>
        <h2 style="color: #10b981;">Task Completed! 🎉</h2>
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>You just completed a task:</p>
        <div style="background: #16213e; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0; color: #10b981;">✓ {task_title}</h3>
        </div>
        <p>You earned <strong>+10 XP</strong>. Keep the streak going!</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px; text-align: center;">— The Kal Se Team</p>
    </div>
    """
    _send_email(user_email, f"🎉 Completed: {task_title}", html)


def notify_task_deleted(user_id: int, task_title: str):
    """In-app notification when a task is deleted (no email for deletes)."""
    _create_notification(user_id, "Task Deleted", f"Task \"{task_title}\" has been deleted.", "TASK_DELETED")


def notify_ai_analysis(user_id: int, task_title: str, category: str, priority: str):
    """In-app notification when AI analysis completes."""
    _create_notification(
        user_id,
        "AI Analysis Complete",
        f"AI finished analyzing \"{task_title}\". Category: {category or 'N/A'}, Priority: {priority or 'N/A'}.",
        "AI_ANALYSIS"
    )
