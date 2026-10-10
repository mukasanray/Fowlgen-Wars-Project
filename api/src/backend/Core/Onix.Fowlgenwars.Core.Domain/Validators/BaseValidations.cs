using FluentValidation;
using FluentValidation.Results;
using Onix.Framework.Notifications.Interfaces;

namespace Onix.Fowlgenwars.Core.Domain.Validators
{
    public abstract class BaseValidator<T> : AbstractValidator<T>
    {
        protected INotificationContext NotificationContext;

        public BaseValidator(INotificationContext notificationContext)
        {
            NotificationContext = notificationContext;
        }

        protected virtual void ProcessValidationResults(ValidationResult validationResults)
        {
            if (!validationResults.IsValid)
            {
                foreach (var error in validationResults.Errors)
                {
                    NotificationContext.AddError(error.ErrorMessage);
                }
            }
        }
    }
}