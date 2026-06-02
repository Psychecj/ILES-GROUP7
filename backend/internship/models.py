"""Django models for the internship app.

This file intentionally stays small and descriptive:
- `User` extends Django's built-in user to add a `role`.
- `WeeklyLog` captures what a student did each week plus a workflow `status`.


"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .constants import (ROLE_CHOICES, LOG_STATUSES,
                        PLACEMENT_STATUSES, 
                        EVAL_STATUSES,
                        VALID_PLACEMENT_TRANSITIONS, 
                        VALID_EVAL_TRANSITIONS, 
                        VALID_LOG_TRANSITIONS )
from django.core.exceptions import ValidationError as DjangoValidationError

class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    This model provides role-based access control for the internship
    management system. Every user belongs to one of the predefined
    roles such as Student, Workplace Supervisor, Academic Supervisor,
    or Internship Administrator.
    """
    #first im ensuring the email is uniques and can be used for login
    email = models.EmailField(unique=True)
    #now im telling django to use email instead of username for login and auth
    USERNAME_FIELD = 'email'
    #now both these fields will be asked for when creating super user
    REQUIRED_FIELDS = ['username','role']
    
    #optional profile picture field for users, stored in 'profile_pictures/' directory
    profile_picture = models.ImageField( upload_to='profile_pictures/', null=True, blank=True)


    
    # High-level user type used throughout the app (e.g., STUDENT/COMPANY/ADMIN).
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STUDENT")

    def __str__(self) -> str:
        """
        Returns a human-readable representation of the user.
        Useful in Django admin and debugging.
        """
        return f"{self.username} ({self.role})"
    


class WeeklyLog(models.Model):
    """
    Stores weekly internship reports submitted by students.

    Each log captures the student's activities, hours worked,
    skills acquired, challenges faced, attachments, and review status.
    """

    # Which student this log belongs to.
    student = models.ForeignKey(User,
    on_delete=models.CASCADE,
    related_name='logs')

    # Week number within the internship period (e.g., 1..12).
    week = models.PositiveIntegerField()

    # Free-form summary of tasks completed this week.
    description = models.TextField()
    # Current workflow state of the log (Draft, Submitted, Reviewed, etc.)
    status = models.CharField(max_length=20, choices= LOG_STATUSES, default="Draft")
    # Placement associated with this internship report
    placement = models.ForeignKey('Placement', on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    # Total hours worked during the week
    hours = models.PositiveIntegerField(default=0)
    # Skills acquired during the reporting period
    skills = models.TextField(blank=True)
    # Challenges encountered during the week
    challenges = models.TextField(blank=True)
    # Optional supporting document or evidence
    attachment = models.FileField(upload_to = 'log_attachments/', null=True, blank=True)
    # Feedback provided by a supervisor
    supervisor_comment = models.TextField(blank=True)
    # Timestamp when the student officially submitted the log
    submitted_at = models.DateTimeField(null=True, blank=True)
    # Timestamp when the record was first created
    created_at = models.DateTimeField(auto_now_add=True)
    # Timestamp of the most recent modification
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate submission deadline.
        Students cannot submit a log after their placement end_date."""
        from django.utils import timezone
        from django.core.exceptions import ValidationError as DjangoValidationError

        if self.placement and self.placement.end_date:
            today = timezone.now().date()
            if today > self.placement.end_date:
                raise DjangoValidationError(
                    f"Cannot submit logs after internship end date({self.placement.end_date})."
                )
            
    def save(self, *args, **kwargs):
        """
        Automatically records the submission timestamp when
        a draft log is moved to the Submitted state.

        Performs full model validation before saving.
        """
        if self.status == 'Submitted' and not self.submitted_at:
            self.submitted_at = timezone.now()
        self.full_clean()
        super().save(*args, **kwargs)

    def change_status(self, new_status):
        """
        Changes the workflow state of the log.

        Validates that the requested transition is allowed
        according to the internship workflow rules.
        """
        validate_transition(self.status, new_status, VALID_LOG_TRANSITIONS)
        self.status = new_status
        self.save()
    
    def __str__(self) :
        return f"Week {self.week} log by {self.student.username} [{self.status}]"
    #this class tells django that the student and week combination must be unique and never duplicate
    class Meta:
        unique_together = ('student','week', 'placement')
        #Ensures one log per student per week per placement
        #A student cannot submit two logs for the same week
        ordering = ['week']
    
class EvaluationForm(models.Model):
    """
    Stores supervisor evaluations of student internship performance.

    Evaluations assess technical skills, communication ability,
    punctuality, and overall performance.
    """
    # Placement being evaluated
    placement = models.ForeignKey('Placement', on_delete=models.CASCADE, related_name='evaluations')
    # Supervisor who submitted this evaluation
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_evaluations')    
    technical_skills = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0),MaxValueValidator(10)]
        ) #this is the score out of 10 for the technical skills of the student
    communication_skills = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
        ) #this is the score out of 10 for the communication skills of the student
    punctuality = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0),MaxValueValidator(10)]
        ) #this is the score out of 10 for the punctuality of the student
    # Additional qualitative remarks about student performance
    overall_comments = models.TextField(blank=True)
    # Current workflow state of the evaluation
    status = models.CharField(max_length=20, choices=EVAL_STATUSES, default='Draft')
    # Timestamp when evaluation was created
    created_at = models.DateTimeField(auto_now_add=True)
    # Timestamp when evaluation was formally submitted
    submitted_at = models.DateTimeField(null=True, blank=True)

    def change_status(self, new_status):
        
        validate_transition(self.status, new_status, VALID_EVAL_TRANSITIONS)
        self.status = new_status
        if new_status == 'Submitted':
            self.submitted_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Evaluation for {self.placement} by {self.submitted_by} ({self.status})"

#This is a custom Exception class to handle invalid log transitions
class InvalidStateError(Exception):
    """this is raised when a state transition is invalid""" 
    pass

#This function validates if a transition from current_status to new_status is allowed and if not calls invalidstateerror
def validate_transition(current_status, new_status, valid_transitions):
    allowed = valid_transitions.get(current_status, [])
    if new_status not in allowed:
        raise InvalidStateError(f"canot transition from {current_status} to {new_status} \n Allowed: {allowed}")
    
class Placement(models.Model):
    """
    Represents a student's internship placement.
    
    Stores information about the company, internship period,
    assigned supervisors, and placement status.
    """
    
    #student undertaking the internship 
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='placements', limit_choices_to={'role':'STUDENT'} )
    workplace_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_placements', limit_choices_to={'role':'WORKPLACE_SUPERVISOR'})
    academic_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='academic_supervised_placements', limit_choices_to={'role':'ACADEMIC_SUPERVISOR'}) 
    
    #name of the internship company/organization  
    company_name = models.CharField(max_length=255)
    
    #internship commencenment date  
    start_date = models.DateField(null=True, blank=True)
    
    #internship completion date  
    end_date = models.DateField(null=True, blank=True)
    
    #current worlflow status of the placement  
    status = models.CharField(max_length=20, choices=PLACEMENT_STATUSES, default='Pending')
    
    #timestamp of when the placement record was recorded in the system
    created_at = models.DateTimeField(auto_now_add=True)
    
    #deadline enforcemennt
    deadline = models.DateField(null=True, blank=True)
    
    #physical address of the workplace, optional but can be useful for record-keeping and reporting
    address = models.CharField(max_length=500, blank=True)
    
    #internship administrator who approved the placement  
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_placements', limit_choices_to={'role': 'INTERNSHIP_ADMIN'})
    

    def change_status(self, new_status):
        """
        Changes the placement workflow status.

        Ensures only valid transitions are allowed,
        such as Pending -> Active -> Completed.
        """
        validate_transition(self.status, new_status, VALID_PLACEMENT_TRANSITIONS)
        self.status = new_status
        self.save()

    def __str__(self):
        return f"{self.student.username} at {self.company_name} ({self.status})" 

    def clean(self):
        """
        Performs business-rule validation.

        Rules:
        - End date must be after start date.
        - A student cannot have overlapping active placements.
        """
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
               raise DjangoValidationError("End date must be after start date.") 
        overlapping = Placement.objects.filter(
            student=self.student,
            start_date__lt=self.end_date,
            end_date__gt=self.start_date,
            status__in=['Pending', 'Active']
        ).exclude(pk=self.pk)
        if overlapping.exists():
            conflict = overlapping.first()
            raise DjangoValidationError(
                f"Overlapping placement exists at {conflict.company_name}"
                f"({conflict.start_date} - {conflict.end_date})."
            )
        
    def save(self, *args, **kwargs):
        self.full_clean() 
        super().save(*args, **kwargs) 

class FinalGrade(models.Model):
    """
    Stores the final internship grade for a placement.

    Grades are automatically calculated from workplace
    supervisor evaluations and mapped to a letter grade.
    """
    # Placement receiving the final grade
    placement = models.OneToOneField(Placement, on_delete=models.CASCADE, related_name='final_grade')
    # User responsible for computing the grade
    computed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='computed_grades')
    # Academic supervisor's score (0-100)
    academic_score = models.FloatField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    #Weighted total - auto-computed, never set manually
    score = models.FloatField(default=0)
    # Letter representation of the score (A-F)
    grade_letter = models.CharField(max_length=5, blank=True)
    # Determines whether students can view the grade
    published = models.BooleanField(default=False)
    # Timestamp when the grade record was generated
    computed_at = models.DateTimeField(auto_now_add=True)
    # Additional grading remarks
    remarks = models.TextField(blank=True)

    def compute_weighted_score(self):
        """Weighted formula (matches course outline Week 9):
        WP technical_skills (out of 10)* 4 = up to 40 points
        WP communication_skills(out of 10)*3 = up to 30 points
        WP punctuality(out of 10)*3 = up to 30 points
        TOTAL = 100 points maximum
        Academic supervisor's score is stored separately for reference but the weighted formula uses WP eval scores."""
        try:
            wp_eval = EvaluationForm.objects.filter(placement=self.placement, status__in=['Submitted', 'Reviewed']
                                                    ).order_by('-submitted_at').first() #get the latest submitted evaluation for this placement
            if not wp_eval:
                return round(self.academic_score, 2) #if no evaluation found, fallback to academic score as final grade
            technical = wp_eval.technical_skills #0-10
            communication = wp_eval.communication_skills #0-10
            punctuality = wp_eval.punctuality #0-10 
            weighted = (technical*4) + (communication*3) + (punctuality*3)
            return round(weighted, 2)
        except EvaluationForm.DoesNotExist:
            return round(self.academic_score, 2)
    
    def compute_grade_letter(self):
        if self.score >= 70:
            return 'A'
        elif self.score >= 60:
            return 'B'
        elif self.score >= 50:
            return 'C'
        elif self.score >= 40:
            return 'D'
        else:
            return 'F'
        
    def save(self,*args,**kwargs):#auto-compute score and grade every time the record is saved
        self.score = self.compute_weighted_score()
        self.grade_letter = self.compute_grade_letter() 
        super().save(*args,**kwargs)  

    def __str__(self):
        return f"Grade for {self.placement.student.username}:{self.grade_letter} ({self.score}/100)"
    class Meta:
    #Prevent double submission - enforced at DB level
    #OneToOneField already guarantees one grade per placement
        pass
        

class LogReview(models.Model):
    """
    Stores supervisor reviews of weekly internship logs.
    """
    # Weekly log being reviewed
    log = models.ForeignKey(WeeklyLog, on_delete = models.CASCADE, related_name='reviews')  
    # Supervisor responsible for the review
    supervisor = models.ForeignKey(User, on_delete = models.SET_NULL, null = True, related_name = 'log_reviews')
    # Review outcome (Approved or Rejected)
    decision = models.CharField(max_length = 20, choices= [('Approved', 'Approved'),('Rejected', 'Rejected')]
                                )     
    # Supervisor feedback regarding the log 
    comment = models.TextField(blank = True)
    # Timestamp of review completion
    reviewed_at = models.DateTimeField(auto_now_add = True)
    def __str__(self):
        return f"Review of Log# {self.log_id} by {self.supervisor} - {self.decision}"
    

class Notification(models.Model):
    """
    Stores system-generated notifications delivered to users.
    """
    # User receiving the notification
    recipient = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'notifications')
    # Notification content
    message = models.TextField()
    # Indicates whether the notification has been read
    is_read = models.BooleanField(default=False)
    # Notification creation timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message[:40]}"
        
class Flag(models.Model):
    """
    Stores issues or concerns raised against a student during internship.
    """
    # Student against whom the concern is raised
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flags', limit_choices_to={'role':'STUDENT'}
                               )
    # User who reported the concern
    raised_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='raised_flags')
    # Description of the issue or concern
    reason = models.TextField()
    # Timestamp when the flag was created
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Flag on {self.student.username} by {self.raised_by}"



    
    