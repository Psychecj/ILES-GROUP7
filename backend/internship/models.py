from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .constants import (ROLE_CHOICES, LOG_STATUSES, PLACEMENT_STATUSES, EVAL_STATUSES, 
                        VALID_PLACEMENT_TRANSITIONS, VALID_EVAL_TRANSITIONS, VALID_LOG_TRANSITIONS )


# Create your models here.
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default ='STUDENT')
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
class WeeklyLog(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    week = models.IntegerField()
    tasks = models.TextField()
    status = models.CharField(max_length=20, choices= LOG_STATUSES, default="Draft")
    placement = models.ForeignKey('Placement', on_delete=models.CASCADE, null=True, blank=True, related_name='logs')
    hours = models.FloatField(default=0)

    skills = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    attachment = models.FileField(upload_to = 'log_attachments/', null=True, blank=True)
    supervisor_comment = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def change_status(self, new_status):
        validate_transition(self.status, new_status, VALID_LOG_TRANSITIONS)
        self.status = new_status
        if new_status == 'Submitted':
            self.submitted_at = timezone.now()
        self.save()
    
    
    def __str__(self):
        return f"Week {self.week} - {self.student.username} ({self.status})"
    
class EvaluationForm(models.Model):
    placement = models.ForeignKey('Placement', on_delete=models.CASCADE, related_name='evaluations')
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_evaluations')    
    technical_skills = models.IntegerField(default=0) #this is the score out of 10 for the technical skills of the student
    communication_skills = models.IntegerField(default=0) #this is the score out of 10 for the communication skills of the student
    punctuality = models.IntegerField(default=0) #this is the score out of 10 for the punctuality of the student
    overall_comments = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=EVAL_STATUSES, default='Draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def change_status(self, new_status):
        validate_transition(self.status, new_status, VALID_EVAL_TRANSITIONS)
        self.status = new_status
        if new_status == 'Submitted':
            self.submitted_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Evaluation for {self.placement} by {self.submitted_by} ({self.status})"        
#This is a custom Exception class to handle invalid log transitions
class invalidStateError(Exception):
    """this is raised when a state transition is invalid""" 
    pass

#This function validates if a transition from current_status to new_status is allowed and if not calls invalidstateerror
def validate_transition(current_status, new_status, valid_transitions):
    allowed = valid_transitions.get(current_status, [])
    if new_status not in allowed:
        raise invalidStateError(f"canot transition from {current_status} to {new_status} \n Allowed: {allowed}")
    
class Placement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='placements', limit_choices_to={'role':'STUDENT'} )
    workplace_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_placements', limit_choices_to={'role':'WORKPLACE_SUPERVISOR'}) 
    company_name = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PLACEMENT_STATUSES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def change_status(self, new_status):
        validate_transition(self.status, new_status, VALID_PLACEMENT_TRANSITIONS)
        self.status = new_status
        self.save()

    def __str__(self):
        return f"{self.student.username} at {self.company_name} ({self.status})"  


class FinalGrade(models.Model):
    placement = models.OneToOneField(Placement, on_delete=models.CASCADE, related_name='final_grade')
    computed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='computed_grades')
    score = models.FloatField(default=0)
    grade_letter = models.CharField(max_length=5, blank=True)
    published = models.BooleanField(default=False)
    computed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Grade for {self.placement.student.username} : {self.grade_letter}"       

