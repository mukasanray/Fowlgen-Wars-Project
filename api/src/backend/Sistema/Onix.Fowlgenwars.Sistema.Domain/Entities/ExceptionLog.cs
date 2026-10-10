using Onix.Fowlgenwars.Core.Domain.Entities;
using System;

namespace Onix.Fowlgenwars.Sistema.Domain.Entities
{
    public class ExceptionLog : AggregateRootEntity
    {
        public Guid Id { get; private set; }
        public DateTime ErrorDate { get; private set; }
        public string Message { get; private set; }
        public string StackTrace { get; private set; }
        public Guid? ParentId { get; private set; }
        public virtual ExceptionLog Parent { get; private set; }

        protected ExceptionLog() { }

        public ExceptionLog (
            Guid id,
            DateTime errorDate,
            string message,
            string stackTrace,
            ExceptionLog parent = null)
        {
                this.Id = id;
                this.ErrorDate = errorDate;
                this.Message = message;
                this.StackTrace = stackTrace;
                this.ParentId = parent?.Id;
                this.Parent = parent;

        }
    }
}

