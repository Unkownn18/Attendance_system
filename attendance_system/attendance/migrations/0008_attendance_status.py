# Generated by Django 5.0.7 on 2024-07-21 09:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0007_remove_attendance_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendance',
            name='status',
            field=models.CharField(choices=[('present', 'Present'), ('absent', 'Absent')], default='absent', max_length=20),
        ),
    ]
